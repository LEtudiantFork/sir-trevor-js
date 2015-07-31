var $                     = require('jquery');
var _                     = require('../lodash.js');
var contentEditableHelper = require('./content-editable-helper.js');
var eventablejs           = require('eventablejs');
var fieldHelper           = require('./field.js');
var imageFilterHelper     = require('./image-filter.js');
var Modal                 = require('etudiant-mod-modal');
var SubBlockSearch        = require('./sub-block-search.class.js');
var subBlockManager       = require('../sub_blocks/sub-block-manager.js');
var xhr                   = require('etudiant-mod-xhr');

var ImageInserter = function(params) {
    this.id = Date.now();

    this.apiUrl = params.apiUrl;
    this.accessToken = params.accessToken;
    this.application = params.application;
    this.filterData = params.filterData;
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

    // @todo: need to put this in i18n
    var filterConfig = {
        accessToken: this.accessToken,
        application: this.application,
        container: this.$imageSearchContainer,
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
                options: fieldHelper.addNullOptionToArray(this.filterData.categories, 'Aucune catégorie')
            }, {
                type: 'select',
                name: 'format',
                label: 'Formats',
                placeholder: 'Sélectionnez un format',
                options: fieldHelper.addNullOptionToArray(this.filterData.formats, 'Aucun format')
            }
        ],
        limit: 20,
        type: 'image',
        url: this.apiUrl + '/edt/media'
    };

    var sliderConfig = {
        controls: {
            next: 'Next',
            prev: 'Prev'
        },
        itemsPerSlide: 3,
        increment: 1,
        container: this.$imageSearchContainer
    };

    this.subBlockSearch = new SubBlockSearch({
        application: this.application,
        accessToken: this.accessToken,
        apiUrl: this.apiUrl,
        $container: this.$imageSearchContainer,
        filterConfig: filterConfig,
        sliderConfig: sliderConfig,
        subBlockType: this.subBlockType,
        subBlockPreProcess: function(subBlockData) {
            return imageFilterHelper.prepareImageFormats(subBlockData, this.filterData.formats);
        }.bind(this)
    });

    this.subBlockSearch.on('ready', function() {
        this.trigger('ready');
    }.bind(this));

    // once an image has been selected from search, we can go to editImage state
    this.subBlockSearch.on('selected', function(selectedDynamicImage) {
        this.editImage(selectedDynamicImage);
    }.bind(this));
};

ImageInserter.prototype = Object.assign(ImageInserter.prototype, {
    editImage: function(dynamicImage, shouldReplace) {
        // create a container for the second 'view' of the image inserter - the image editor
        this.$imageEditor = $('<div class="image-inserter image-inserter-edit"></div>');

        // append image and submit button
        this.$imageEditor.append(dynamicImage.renderLarge());
        this.$imageEditor.append('<button>go</button>');

        this.modal.append(this.$imageEditor);
        this.modal.open();

        this.$imageEditor.on('click', 'button', function(e) {
            e.stopPropagation();

            if (shouldReplace) {
                this.trigger('replace', dynamicImage);
            }
            else {
                this.trigger('selected', dynamicImage);
            }

            this.close();
        }.bind(this));
    },

    openSearch: function() {
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
    },

    reinitialiseImages: function(params) {
        var self = this;

        var block = params.block;
        var storedDynamicImageData = params.storedData.dynamicImages;
        var storedTextData = params.storedData.text;

        return Promise.all(
            // populate an array of promises; each corresponding to a request for an image
            Object.keys(storedDynamicImageData).map(function(dynamicImageId) {
                var retrievalUrl = block.globalConfig.apiUrl + '/edt/media/' + dynamicImageId;

                return xhr.get(retrievalUrl, {
                    data: {
                        access_token: block.globalConfig.accessToken
                    }
                });
            })
        )
        .then(function(rawDynamicImageData) {
            // add the formats property to each image with the human readable image formats eg '500x500'
            return rawDynamicImageData.map(function(singleRawDynamicImageData) {
                return imageFilterHelper.prepareSingleImageFormat(singleRawDynamicImageData.content, self.filterData.formats);
            });
        })
        .then(function(formattedDynamicImageData) {
            var dynamicImages = formattedDynamicImageData.map(function(singleFormattedDynamicImageData) {

                function findStoredImageDataItemByID(id, storedImageData) {
                    var result;

                    Object.keys(storedImageData).some(function(singleStoredImageData) {
                        if (storedImageData[singleStoredImageData].id.toString() === id.toString()) {
                            result = storedImageData[singleStoredImageData];
                            return true;
                        }
                        return false;
                    });

                    return result;
                }

                var storedDynamicImageDataItem = findStoredImageDataItemByID(singleFormattedDynamicImageData.id, storedDynamicImageData);

                singleFormattedDynamicImageData = Object.assign({}, singleFormattedDynamicImageData, storedDynamicImageDataItem);

                return subBlockManager.buildSingle({
                    accessToken: block.globalConfig.accessToken,
                    apiUrl: block.globalConfig.apiUrl,
                    application: block.globalConfig.application,
                    content: singleFormattedDynamicImageData,
                    parentID: block.blockID,
                    type: 'dynamicImage'
                });
            });

            // get all the image placeholders in the text
            var dynamicImagePlaceholders = storedTextData.match(/@{[0-9]+}@/gm);

            dynamicImagePlaceholders.forEach(function(dynamicImagePlaceholder) {
                // get just the ID of the dynamic image from the text
                var dynamicImageID = storedTextData.match(/@{([0-9]+)}@/)[1];

                // get the corresponding subblock from the array we populated earlier
                var dynamicImage = subBlockManager.getSubBlockByID(dynamicImages, dynamicImageID);

                // get the rawHTML for this subBlock (so we lose the events and will have to rebind it later)
                var dynamicImageHTML = dynamicImage.getHTMLPlaceholder();

                // replace placeholder with html in text
                storedTextData = storedTextData.replace(dynamicImagePlaceholder, dynamicImageHTML);
            });

            // make sure that imageinserter is ready in case we need to edit an image
            return {
                text: storedTextData,
                dynamicImages: dynamicImages
            };
        })
        .catch(function(err) {
            console.error(err);
        });
    }

}, eventablejs);

// Static classes

// use static class method to return callback with insertion point on click in editable area of block
ImageInserter.awaitClick = function($elem, cb) {
    $elem.css('cursor', 'copy');

    $elem.one('click', function() {
        $elem.css('cursor', '');

        cb(contentEditableHelper.getRange());
    });
};

ImageInserter.insertImage = function(insertionPoint, elem) {
    contentEditableHelper.insertElementAtRange(insertionPoint, elem);
};

ImageInserter.prepareParams = function(params) {
    // make a first request to get all filter information
    return imageFilterHelper.fetch({
        apiUrl: params.apiUrl,
        application: params.application,
        accessToken: params.accessToken
    })
    // @todo is filterData still the best name for this return variable?
    .then(function(filterData) {

        params.filterData = filterData;

        return params;
    });
};

ImageInserter.saveDynamicImage = function(store, dynamicImage) {
    // create dynamic images object if missing
    if (!store.dynamicImages) {
        store.dynamicImages = {};
    }

    // store dynamicImage on block
    store.dynamicImages[dynamicImage.id] = {
        activeFormat: dynamicImage.content.activeFormat,
        align: dynamicImage.content.align,
        id: dynamicImage.id,
        legend: dynamicImage.content.legend,
        link: dynamicImage.content.link
    };
};

ImageInserter.extractContent = function(textContent, storedDynamicImages) {
    var newDynamicImages;
    var imageMarkup = textContent.match(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gm);

    if (imageMarkup) {
        // get the ids of the dynamic images in the HTML
        var imagesIDsInHTML = imageMarkup.map(function(imageMarkupItem) {
            var dynamicImageID = imageMarkupItem.match(/data-sub-block-in-block="([0-9]+)"/)[1];

            // replace each dynamic image string with a custom placeholder eg. @{204520}@
            textContent = textContent.replace(imageMarkupItem, '@{' + dynamicImageID + '}@');

            return dynamicImageID;
        });


        if (imagesIDsInHTML.length > 0) {
            // if there are dynamic images, they are obligatorily in the block data store - let's get an array of their ids
            var storedImageIDs = Object.keys(storedDynamicImages);

            // get remaining image IDs - i.e ones that are both in the store AND in the HTML
            var remainingImageIDs = _.intersection(storedImageIDs, imagesIDsInHTML);

            newDynamicImages = {};

            remainingImageIDs.forEach(function(remainingImageID) {
                newDynamicImages[remainingImageID] = storedDynamicImages[remainingImageID];
            });
        }

    }

    return {
        textContent: textContent,
        dynamicImages: newDynamicImages
    };

};

ImageInserter.init = function(block) {

    if (!block.imageInserter) {
        // return promise to initialise
        return ImageInserter.prepareParams({
            accessToken: block.globalConfig.accessToken,
            apiUrl: block.globalConfig.apiUrl,
            application: block.globalConfig.application,
            blockRef: block,
            subBlockType: 'dynamicImage'
        })
        .then(function(preparedParams) {
            block.imageInserter = new ImageInserter(preparedParams);
        });
    }

    block.imageInserter.clearOnSelected();

    return Promise.resolve();
};

module.exports = ImageInserter;
