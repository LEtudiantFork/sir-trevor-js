var $                     = require('jquery');
var _                     = require('../lodash.js');
var contentEditableHelper = require('./content-editable-helper.js');
var eventablejs           = require('eventablejs');
var FilterBar             = require('./filterbar.class.js');
var Modal                 = require('etudiant-mod-modal');
var Slider                = require('./slider.class.js');
var subBlockManager       = require('../sub_blocks/index.js');
var utils                 = require('../utils.js');
var xhr                   = require('etudiant-mod-xhr');
var Zoom                  = require('etudiant-mod-zoom'); // do I need this?

var subBlockType = 'dynamicImage';

//
function registerWatch(imageInserter) {
    subBlockManager.bindEventsOnContainer('change', imageInserter.slider.$elem, function(selectedSubBlockId, selectedElement) {
        debugger;

        // var selectedSubBlock = subBlockManager.getSubBlockById(selectedSubBlockId, block.subBlocks);

        // block.subBlockSearch.trigger('selected', selectedSubBlock);
    });
}

// adds an option to 'reset' the select field in question
function addNullOptionToArray(array, message) {
    var arrayCopy = array.slice();

    arrayCopy.unshift({
        value: '',
        label: message
    });

    return arrayCopy;
}

// prepares data for a template like '<option value="<%= value %>"><%= label %></option>'
function prepareForSelect(array, valueKeyName, labelKeyName) {
    return array.map(function(arrayItem) {
        return {
            label: arrayItem[labelKeyName],
            value: arrayItem[valueKeyName]
        };
    });
}

// adds format strings like '500x500' to each image
function prepareImageFormats(images, formats) {
    return images.map(function(image) {
        image.formats = formats.filter(function(singleFormat) {
            return image.format_ids.indexOf(singleFormat.value) !== -1;
        });
        return image;
    });
}

function filterUpdate(imageInserter, contentType) {
    imageInserter.slider.on('progress', function() {
        imageInserter.filterBar.moreResults();
    });

    imageInserter.filterBar.on('update:result', function(images) {
        // we process the results to find the corresponding format size eg. '100x100' per format_id eg. '73'
        images = prepareImageFormats(images, imageInserter.filterData.formats);

        // we build multiple instances of the 'DyanmicImage' subBlock and concatenate them onto existing subBlocks
        var additionalSubBlocks = subBlockManager.build(subBlockType, null, images);
        imageInserter.subBlocks = imageInserter.subBlocks.concat(additionalSubBlocks);

        // we generate the markup for these subBlocks
        var subBlockMarkup = subBlockManager.render(additionalSubBlocks);

        imageInserter.slider.update(subBlockMarkup);
    });
}

function filterSearch(imageInserter, contentType) {
    imageInserter.filterBar.on('search:start', function() {});

    imageInserter.filterBar.on('search:result', function(images) {
        // we process the results to find the corresponding format size eg. '100x100' per format_id eg. '73'
        images = prepareImageFormats(images, imageInserter.filterData.formats);

        // we build multiple instances of the 'DyanmicImage' subBlock
        imageInserter.subBlocks = subBlockManager.build(subBlockType, null, images);

        // we generate the markup for these subBlocks
        var subBlockMarkup = subBlockManager.render(imageInserter.subBlocks);

        // we update the slider with this markup
        imageInserter.slider.reset(subBlockMarkup);
    });

    imageInserter.filterBar.on('search:no-result', function() {
        imageInserter.subBlocks = [];
        imageInserter.slider.reset();
    });
}

var ImageInserter = function() {
    this.init.apply(this, arguments);
};

var prototype = {
    init: function(params) {
        var self = this;

        // initialise the modal
        this.modal = new Modal({
            slug: 'image-inserter',
            animation: 'fade',
            theme: 'plain',
            cssClasses: 'pandora'
        });

        // create a wrapper element for our filterbar and slider
        this.$elem = $('<div></div>');
        this.$elem.addClass('image-inserter');

        // make a first request to get all filter information
        xhr.get(params.apiUrl + '/edt/media/filters/' + params.application, {
            data: {
                access_token: params.accessToken
            }
        })
        .then(function(filterData) {
            // store the filter information on our ImageInserter instance
            if (filterData && filterData.content) {
                // homogenise the data into label,value pairs for the filterbar's select
                self.filterData = {
                    categories: prepareForSelect(filterData.content.categories, 'id', 'label'),
                    copyrights: prepareForSelect(filterData.content.copyrights, 'id', 'name'),
                    formats: prepareForSelect(filterData.content.formats, 'id', 'label')
                };
            }

            // @todo: need to put this in i18n
            var filterConfig = {
                accessToken: params.accessToken,
                application: params.application,
                container: self.$elem,
                fields: [
                    {
                        type: 'search',
                        name: 'query',
                        placeholder: 'Rechercher'
                    }, {
                        type: 'select',
                        name: 'category',
                        label: 'Catégories',
                        placeholder: 'Sélectionnez une catégorie',
                        options: addNullOptionToArray(self.filterData.categories, 'Aucune catégorie')
                    }, {
                        type: 'select',
                        name: 'format',
                        label: 'Formats',
                        placeholder: 'Sélectionnez un format',
                        options: addNullOptionToArray(self.filterData.formats, 'Aucun format')
                    }
                ],
                limit: 20,
                type: 'image',
                url: params.apiUrl + '/edt/media'
            };

            var sliderConfig = {
                controls: {
                    next: 'Next',
                    prev: 'Prev'
                },
                itemsPerSlide: 3,
                increment: 1,
                container: self.$elem
            };

            // initialise the filterbar
            self.filterBar = new FilterBar(filterConfig);

            // initialise the slider
            self.slider = window.slider = new Slider(sliderConfig);

            // determine what happens when filter searches and updates
            filterUpdate(self);
            filterSearch(self);

            // append created element inside modal
            self.modal.append(self.$elem);

            self.filterBar.search();

            registerWatch(self);
        })
        .catch(function(error) {
            console.error(error);
        });
    },

    open: function() {
        this.modal.open();
    }
};

ImageInserter.prototype = Object.assign(prototype, eventablejs);

module.exports = ImageInserter;

