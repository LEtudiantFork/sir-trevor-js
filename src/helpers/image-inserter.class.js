var $                     = require('jquery');
var contentEditableHelper = require('./content-editable-helper.js');
var eventablejs           = require('eventablejs');
var fieldHelper           = require('./field.js');
var imageFilterHelper     = require('./image-filter.js');
var Modal                 = require('etudiant-mod-modal');
var SubBlockSearch        = require('./sub-block-search.class.js');
var subBlockManager       = require('../sub_blocks/sub-block-manager.js');
var xhr                   = require('etudiant-mod-xhr');

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
    imageFilterHelper.fetch({
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
                return imageFilterHelper.prepareImageFormats(subBlockData, self.filterData.formats);
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

ImageInserter.init = function(block) {
    return isInstantiated(block.imageInserter)
    .then(function() {
        // if it's instantiated, we can open the image inserter straight away so let's trigger ready
        block.imageInserter.trigger('ready');
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
    })
    // as this follows the above then/catch, it will always run
    .then(function() {
        // in case we closed the modal, we need to clear the onSelected
        block.imageInserter.clearOnSelected();

        // prepare behaviour for an image that has already been added but is then altered
        block.imageInserter.on('replace', function(dynamicImage) {
            ImageInserter.saveDynamicImage(block.blockStorage.data, dynamicImage);

            dynamicImage.replaceRenderedInBlock();
        });

        return Promise.resolve();
    });
};

ImageInserter.saveDynamicImage = function(store, dynamicImage) {
    // create dynamic images object if missing
    if (!store.dynamicImages) {
        store.dynamicImages = {};
    }

    // store dynamicImage on block
    store.dynamicImages[dynamicImage.id] = {
        align: dynamicImage.align,
        id: dynamicImage.id,
        legend: dynamicImage.legend,
        format: dynamicImage.activeFormat
    };
};

ImageInserter.reinitialiseImages = function(params) {
    var block = params.block;

    var storedDynamicImageData = params.storedData.dynamicImages;
    var storedTextData = params.storedData.text;

    // for the filter format data
    var formattedFilterData;

    var dynamicImagesPromises = [];

    // populate an array of promises; each corresponding to a request for an image
    Object.keys(storedDynamicImageData).forEach(function(dynamicImageId) {
        var retrievalUrl = block.globalConfig.apiUrl + '/edt/media/' + dynamicImageId;

        dynamicImagesPromises.push(
            xhr.get(retrievalUrl, {
                data: {
                    access_token: block.globalConfig.accessToken
                }
            })
        );
    });

    // first, fetch the format data we need to correspond with the format_ids that the api sends us
    return imageFilterHelper.fetch({
        apiUrl: block.globalConfig.apiUrl,
        application: block.globalConfig.application,
        accessToken: block.globalConfig.accessToken
    })
    .then(function(formattedData) {
        // store this formatted data on our block
        formattedFilterData = formattedData;

        // get the raw image data from the api for each image id saved in block data
        return Promise.all(dynamicImagesPromises);
    })
    .then(function(rawDynamicImageData) {
        // add the formats property to each image with the human readable image formats eg '500x500'
        return rawDynamicImageData.map(function(singleRawDynamicImageData) {
            return imageFilterHelper.prepareSingleImageFormat(singleRawDynamicImageData.content, formattedFilterData.formats);
        });
    })
    .then(function(formattedDynamicImageData) {
        var dynamicImages = formattedDynamicImageData.map(function(singleFormattedDynamicImageData) {

            function findStoredImageDataItemByID(id, storedImageData) {
                var result;

                Object.keys(storedImageData).some(function(singleStoredImageData) {
                    if (storedImageData[singleStoredImageData].id.toString() === id) {
                        result = storedImageData[singleStoredImageData];
                        return true;
                    }
                    return false;
                });

                return result;
            }

            var storedDynamicImageDataItem = findStoredImageDataItemByID(singleFormattedDynamicImageData.id, storedDynamicImageData);

            singleFormattedDynamicImageData = Object.assign(singleFormattedDynamicImageData, storedDynamicImageDataItem);

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
        return ImageInserter.init(block)
            .then(function() {
                return {
                    text: storedTextData,
                    dynamicImages: dynamicImages
                };
            });
    })
    .catch(function(err) {
        console.error(err);
    });
};

ImageInserter.checkForDynamicImageStrings = function(textContent, blockStore) {
    var dynamicImageStrings = textContent.match(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gm);

    if (dynamicImageStrings) {
        var dynamicImagesInHTML = [];

        // get the ids of the dynamic images in the HTML
        dynamicImageStrings.forEach(function(dynamicImageString) {
            var dynamicImageID = dynamicImageString.match(/data-sub-block-in-block="([0-9]+)"/)[1];

            dynamicImagesInHTML.push(dynamicImageID);

            // replace each dynamic image string with a custom placeholder eg. @{204520}@
            textContent = textContent.replace(dynamicImageString, '@{' + dynamicImageID + '}@');
        });

        if (dynamicImagesInHTML.length > 0) {
            // if there are dynamic images, they are obligatorily in the block data store - let's get an array of their ids
            var storedDynamicImages = Object.keys(blockStore.dynamicImages);

            // get any dynamic images that are in the store but not in the html (i.e images that have been deleted in the editor since they were added)
            var absentDynamicImages = _.difference(storedDynamicImages, dynamicImagesInHTML);

            // we delete these references from the dynamicImages store of the block
            absentDynamicImages.forEach(function(absentDynamicImage) {
                delete blockStore.dynamicImages[absentDynamicImage];
            });
        }

        return Promise.resolve(textContent);
    }

    return Promise.reject();
};

module.exports = ImageInserter;
