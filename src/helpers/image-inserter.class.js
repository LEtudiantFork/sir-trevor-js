var $                     = require('jquery');
// var contentEditableHelper = require('./content-editable-helper.js');
var eventablejs           = require('eventablejs');
var fieldHelper           = require('./field.js');
var Modal                 = require('etudiant-mod-modal');
var SubBlockSearch        = require('./sub-block-search.class.js');
var xhr                   = require('etudiant-mod-xhr');

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

var ImageInserter = function(params) {
    var self = this;

    this.id = Date.now();

    this.apiUrl = params.apiUrl;
    this.accessToken = params.accessToken;
    this.application = params.application;
    this.subBlockType = params.subBlockType;

    // initialise the modal
    this.modal = new Modal({
        slug: 'image-inserter',
        animation: 'fade',
        theme: 'plain',
        cssClasses: 'pandora'
    });

    // create a wrapper element for our filterbar and slider
    this.$imageSearch = $('<div class="image-inserter image-inserter-search"></div>');

    // make a first request to get all filter information
    xhr.get(this.apiUrl + '/edt/media/filters/' + this.application, {
        data: {
            access_token: this.accessToken
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
            accessToken: self.accessToken,
            application: self.application,
            container: self.$imageSearch,
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
                    options: fieldHelper.addNullOptionToArray(self.filterData.categories, 'Aucune catégorie')
                }, {
                    type: 'select',
                    name: 'format',
                    label: 'Formats',
                    placeholder: 'Sélectionnez un format',
                    options: fieldHelper.addNullOptionToArray(self.filterData.formats, 'Aucun format')
                }
            ],
            limit: 20,
            type: 'image',
            url: self.apiUrl + '/edt/media'
        };

        var sliderConfig = {
            controls: {
                next: 'Next',
                prev: 'Prev'
            },
            itemsPerSlide: 3,
            increment: 1,
            container: self.$imageSearch
        };

        self.modal.append(self.$imageSearch);

        self.subBlockSearch = new SubBlockSearch({
            application: self.application,
            accessToken: self.accessToken,
            apiUrl: self.apiUrl,
            $container: self.$imageSearch,
            filterConfig: filterConfig,
            sliderConfig: sliderConfig,
            subBlockType: self.subBlockType,
            subBlockPreProcess: function(subBlockData) {
                return prepareImageFormats(subBlockData, self.filterData.formats);
            }
        });

        self.subBlockSearch.on('selected', function(selectedDynamicImage) {
            self.editImage(selectedDynamicImage);
        });
    })
    .catch(function(error) {
        console.error(error);
    });
};

var prototype = {
    editImage: function(DynamicImage) {
        // create a container for the second 'view' of the image inserter - the image editor
        this.$imageEditor = $('<div class="image-inserter image-inserter-edit"></div>');

        this.$imageEditor.append(DynamicImage.renderLarge());
        this.$imageEditor.append('<button>go</button>');

        this.$imageEditor.on('click', 'button', function(e) {
            debugger;

            var data = DynamicImage.getData();

            // place into text

            this.trigger('selected', data);

        }.bind(this));

        this.modal.append(this.$imageEditor);
    },

    open: function() {
        this.modal.open();
    }
};

ImageInserter.prototype = Object.assign(prototype, eventablejs);

module.exports = ImageInserter;
