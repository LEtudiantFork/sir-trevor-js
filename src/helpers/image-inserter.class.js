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

function prepareForSelect(array, valueKeyName, labelKeyName) {
    return array.map(function(arrayItem) {
        return {
            label: arrayItem[labelKeyName],
            value: arrayItem[valueKeyName]
        };
    });
}

function filterUpdate(imageInserter, contentType) {
    imageInserter.slider.on('progress', function() {
        imageInserter.filterBar.moreResults();
    });

    imageInserter.filterBar.on('update:result', function(updateResults) {
        // var additionalSubBlocks = subBlockManager.build(block.type, contentType, updateResults);
        // var subBlockMarkup = subBlockManager.render(additionalSubBlocks);

        // block.subBlocks = block.subBlocks.concat(additionalSubBlocks);

        // block.slider.update(subBlockMarkup);
    });
}

function filterSearch(imageInserter, contentType) {
    imageInserter.filterBar.on('search:start', function() {});

    imageInserter.filterBar.on('search:result', function(searchResults) {
        debugger;
        // we process the results to find the corresponding format size eg. '100x100' per format_id eg. '73'
        searchResults = searchResults.map(function(searchResultItem) {
            searchResultItem.formats = imageInserter.filterData.formats.filter(function(formatItem) {
                return searchResultItem.format_ids.indexOf(formatItem.value) !== -1;
            });

            return searchResultItem;
        });

        // we build multiple instances of the 'DyanmicImage' subBlock
        imageInserter.subBlocks = subBlockManager.build(subBlockType, null, searchResults);

        // we generate the markup for these subBlocks
        var subBlockMarkup = subBlockManager.render(imageInserter.subBlocks);

        // we update the slider with this markup
        imageInserter.slider.reset(subBlockMarkup);


        // registerClickOnContents(block);
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
            theme: 'plain'
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
                        options: self.filterData.categories
                    }, {
                        type: 'select',
                        name: 'format',
                        label: 'Formats',
                        placeholder: 'Sélectionnez un format',
                        options: self.filterData.formats
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
            self.slider = new Slider(sliderConfig);

            // determine what happens when filter searches and updates
            filterUpdate(self);
            filterSearch(self);

            // append created element inside modal
            self.modal.append(self.$elem);

            self.filterBar.search();
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

