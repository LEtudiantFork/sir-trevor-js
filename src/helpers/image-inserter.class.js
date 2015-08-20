var $                     = require('jquery');
var _                     = require('../lodash.js');
var contentEditableHelper = require('./content-editable.js');
var eventablejs           = require('eventablejs');
var fieldHelper           = require('./field.js');
var imageFilterHelper     = require('./image-filter.js');
var i18n                  = require('../i18n-stub.js');
var Modal                 = require('etudiant-mod-modal');
var SubBlockSearch        = require('./sub-block-search.class.js');
var subBlockManager       = require('../sub_blocks/manager.js');
var xhr                   = require('etudiant-mod-xhr');

function prepareParams(params) {
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
}

var imageInserterPrototype = {
    clearOnSelected: function() {
        if (this._events) {
            this._events.selected = undefined;
        }
    },

    editImage: function(dynamicImage, shouldReplace) {
        if (this.searchModal.isOpened) {
            this.searchModal.close();
        }

        // create a container for the second 'view' of the image inserter - the image editor
        this.$imageEditor = $('<div class="image-inserter image-inserter-edit"></div>');

        // append image and submit button
        this.$imageEditor.append(dynamicImage.renderLarge());

        this.editorModal.open();

        this.editorModal.appendToContentArea(this.$imageEditor);

        this.editorModal.on('close', function() {
            if (shouldReplace) {
                this.trigger('replace', dynamicImage);
            }
            else {
                this.trigger('selected', dynamicImage);
            }
        }.bind(this));
    },

    openSearch: function() {
        if (this.editorModal.isOpened) {
            this.editorModal.close();
        }

        this.searchModal.open();

        this.searchModal.appendToContentArea(this.$imageSearchContainer);

        this.subBlockSearch.refreshDimensions();
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
};

module.exports = {
    awaitClick: function($elem, cb) {
        $elem.css('cursor', 'copy');

        $elem.one('click', function() {
            $elem.css('cursor', '');

            cb(contentEditableHelper.getRange());
        });
    },

    init: function(block) {

        if (!block.imageInserter) {
            // return promise to initialise
            return prepareParams({
                accessToken: block.globalConfig.accessToken,
                apiUrl: block.globalConfig.apiUrl,
                application: block.globalConfig.application,
                blockRef: block,
                subBlockType: 'dynamicImage'
            })
            .then(function(preparedParams) {
                block.imageInserter = Object.assign({}, imageInserterPrototype, eventablejs);

                block.imageInserter.id = Date.now();

                block.imageInserter.apiUrl = preparedParams.apiUrl;
                block.imageInserter.accessToken = preparedParams.accessToken;
                block.imageInserter.application = preparedParams.application;
                block.imageInserter.filterData = preparedParams.filterData;
                block.imageInserter.subBlockType = preparedParams.subBlockType;

                // initialise the modal
                block.imageInserter.searchModal = new Modal({
                    slug: 'image-inserter',
                    animation: 'fade',
                    theme: 'pandora'
                });

                block.imageInserter.searchModal.render({
                    header: 'Choisissez un service',
                    content: '',
                    footer: {
                        ok: 'OK'
                    }
                });

                block.imageInserter.editorModal = new Modal({
                    slug: 'image-inserter',
                    animation: 'fade',
                    theme: 'pandora'
                });

                block.imageInserter.editorModal.render({
                    header: 'Editer l\'image',
                    content: '',
                    footer: {
                        ok: 'OK'
                    }
                });

                // create a wrapper element for our filterbar and slider
                block.imageInserter.$imageSearchContainer = $('<div class="image-inserter image-inserter-search"></div>');

                // @todo: need to put this in i18n
                var filterConfig = {
                    accessToken: block.imageInserter.accessToken,
                    application: block.imageInserter.application,
                    container: block.imageInserter.$imageSearchContainer,
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
                            options: fieldHelper.addNullOptionToArray(block.imageInserter.filterData.categories, 'Aucune catégorie')
                        }, {
                            type: 'select',
                            name: 'format',
                            label: 'Formats',
                            placeholder: 'Sélectionnez un format',
                            options: fieldHelper.addNullOptionToArray(block.imageInserter.filterData.formats, 'Aucun format')
                        }
                    ],
                    limit: 20,
                    type: 'image',
                    url: block.imageInserter.apiUrl + '/edt/media'
                };

                var sliderConfig = {
                    controls: {
                        next: 'Next',
                        prev: 'Prev'
                    },
                    itemsPerSlide: 3,
                    increment: 1,
                    container: block.imageInserter.$imageSearchContainer
                };

                block.imageInserter.subBlockSearch = new SubBlockSearch({
                    application: block.imageInserter.application,
                    accessToken: block.imageInserter.accessToken,
                    apiUrl: block.imageInserter.apiUrl,
                    $container: block.imageInserter.$imageSearchContainer,
                    filterConfig: filterConfig,
                    sliderConfig: sliderConfig,
                    subBlockType: block.imageInserter.subBlockType,
                    subBlockPreProcess: function(subBlockData) {
                        return imageFilterHelper.prepareImageFormats(subBlockData, block.imageInserter.filterData.formats);
                    }
                });

                block.imageInserter.subBlockSearch.on('ready', function() {
                    block.imageInserter.trigger('ready');
                });

                // once an image has been selected from search, we can go to editImage state
                block.imageInserter.subBlockSearch.on('selected', function(selectedDynamicImage) {
                    block.imageInserter.editImage(selectedDynamicImage);
                });
            });
        }

        block.imageInserter.clearOnSelected();

        return Promise.resolve();
    },

    insertImage: function(insertionPoint, elem) {
        contentEditableHelper.insertElementAtRange(insertionPoint, elem);
    },

    saveImage: function(store, dynamicImage) {
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
    },

    extractContent: function(textContent, storedDynamicImages) {
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
    }
};
