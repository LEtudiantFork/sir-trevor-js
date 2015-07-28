var $                     = require('jquery');
var contentEditableHelper = require('./content-editable-helper.js');
var eventablejs           = require('eventablejs');
var fieldHelper           = require('./field.js');
var imageFormatHelper     = require('./image-format.js');
var Modal                 = require('etudiant-mod-modal');
var SubBlockSearch        = require('./sub-block-search.class.js');

var ImageInserter = function(params) {
    var self = this;

    // create random id
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
    this.$imageSearchContainer = $('<div class="image-inserter image-inserter-search"></div>');

    // make a first request to get all filter information
    imageFormatHelper.fetchFormats({
        apiUrl: this.apiUrl,
        application: this.application,
        accessToken: this.accessToken
    })
    // @todo is filterData still the best name for this return variable?
    .then(function(filterData) {
        // store the filter information on our ImageInserter instance
        self.filterData = filterData;

        // @todo: need to put this in i18n
        var filterConfig = {
            accessToken: self.accessToken,
            application: self.application,
            container: self.$imageSearchContainer,
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
            container: self.$imageSearchContainer
        };

        self.subBlockSearch = new SubBlockSearch({
            application: self.application,
            accessToken: self.accessToken,
            apiUrl: self.apiUrl,
            $container: self.$imageSearchContainer,
            filterConfig: filterConfig,
            sliderConfig: sliderConfig,
            subBlockType: self.subBlockType,
            subBlockPreProcess: function(subBlockData) {
                return imageFormatHelper.prepareImageFormats(subBlockData, self.filterData.formats);
            }
        });

        self.subBlockSearch.on('ready', function() {
            self.trigger('ready');
        });

        // once an image has been selected from search, we can go to editImage state
        self.subBlockSearch.on('selected', function(selectedDynamicImage) {
            self.editImage(selectedDynamicImage);
        });
    })
    .catch(function(error) {
        console.error(error);
    });
};

var prototype = {
    editImage: function(dynamicImage) {
        // create a container for the second 'view' of the image inserter - the image editor
        this.$imageEditor = $('<div class="image-inserter image-inserter-edit"></div>');

        // append image and submit button
        this.$imageEditor.append(dynamicImage.renderLarge());
        this.$imageEditor.append('<button>go</button>');

        this.$imageEditor.on('click', 'button', function(e) {
            e.stopPropagation();

            this.trigger('selected', dynamicImage);

            this.close();
        }.bind(this));

        this.modal.append(this.$imageEditor);
    },

    open: function() {
        this.modal.append(this.$imageSearchContainer);

        this.modal.open();

        this.subBlockSearch.refreshDimensions();
    },

    close: function() {
        this.modal.close();
    },

    clearOnSelected: function() {
        if (this._events) {
            this._events.selected = undefined;
        }
    }
};

ImageInserter.prototype = Object.assign({}, prototype, eventablejs);

// Static classes

function isInstantiated(imageInserterInstance) {
    if (imageInserterInstance) {
        return Promise.resolve();
    }

    return Promise.reject();
}

function getInsertionPoint($elem, cb) {
    $elem.css('cursor', 'copy');

    $elem.one('click', function() {
        $elem.css('cursor', '');

        cb(contentEditableHelper.getRange());
    });
}

function insertImage(insertionPoint, elem) {
    contentEditableHelper.insertElementAtRange(insertionPoint, elem);
}

ImageInserter.init = function(block) {
    // use static class method to return callback with insertion point on click in editable area of block
    getInsertionPoint(block.getTextBlock(), function(insertionPoint) {

        block.imageInsertAwaitingClick = false;

        // check if image inserter is instantiated
        isInstantiated(block.imageInserter)
            .then(function() {
                // if it's instantiated, we can open the image inserter straight away
                block.imageInserter.open();
            })
            .catch(function() {
                // if not, we have to instantiate it
                block.imageInserter = new ImageInserter({
                    accessToken: block.globalConfig.accessToken,
                    apiUrl: block.globalConfig.apiUrl,
                    application: block.globalConfig.application,
                    blockRef: block,
                    subBlockType: 'dynamicImage'
                });

                // once it's ready, then we can open it
                block.imageInserter.once('ready', function() {
                    block.imageInserter.open();
                });
            })
            // as this follows the above then/catch, it will always run
            .then(function() {
                // in case we closed the modal, we need to clear the onSelected
                block.imageInserter.clearOnSelected();

                // we set a listener for the onSelected behaviour
                block.imageInserter.once('selected', function(dynamicImage) {
                    // create dynamic images object if missing
                    if (!block.blockStorage.data.dynamicImages) {
                        block.blockStorage.data.dynamicImages = {};
                    }

                    // store dynamicImage on block
                    block.blockStorage.data.dynamicImages[dynamicImage.id] = {
                        position: dynamicImage.position,
                        id: dynamicImage.id,
                        legend: dynamicImage.legend,
                        format: dynamicImage.activeFormat
                    };

                    // static method to insert the element at the insertionPoint
                    insertImage(insertionPoint, dynamicImage.renderInBlock().get(0));
                });
            });
    });
};

module.exports = ImageInserter;
