/*
  Text Block
*/

var _                     = require('../lodash.js');
var Block                 = require('../block');
var contentEditableHelper = require('../helpers/content-editable-helper.js');
var ImageInserter         = require('../helpers/image-inserter.class.js');
var imageFormatHelper     = require('../helpers/image-format.js');
var stToHTML              = require('../to-html');
var subBlockManager       = require('../sub_blocks/sub-block-manager.js');
var utils                 = require('../utils.js');
var xhr                   = require('etudiant-mod-xhr');
var stToMarkdown          = require('../to-markdown.js');

module.exports = Block.extend({

    type: 'text',

    title: i18n.t('blocks:text:title'),

    controllable: true,
    formattable: true,
    paragraphable: true,

    editorHTML: '<div class="st-required text-block st-text-block" contenteditable="true"></div>',

    icon_name: 'paragraph',

    controls_position: 'bottom',
    controls_visible: true,
    controls: [
        {
            slug: 'show-picture',
            icon: 'image',
            sleep: true,
            eventTrigger: 'click',
            fn: function() {
                // check if image inserter is waiting for a click
                if (!this.imageInsertAwaitingClick) {
                    this.imageInsertAwaitingClick = true;

                    // use static method, passing the block instance
                    ImageInserter.init(this);
                }
            }
        },
        {
            slug: 'add-paragraph',
            icon: 'Paragraph', // @todo find a proper icon for this
            sleep: true,
            eventTrigger: 'click',
            fn: function() {
                contentEditableHelper.splitContentAtCaret(this.getTextBlock(), function(firstParagraph, secondParagraph) {

                    // @todo: as this creates just a 'string', we need to go back through the method
                    this.getTextBlock().html(firstParagraph);

                    // create a second block with the same content as the last
                    this.mediator.trigger('block:create', 'text', {
                        text: secondParagraph
                    });

                }.bind(this));
            }
        }
    ],

    onBlockRender: function() {
        contentEditableHelper.normaliseNewLine(this.getTextBlock());
    },

    _serializeData: function() {
        var self = this;
        var data = {};
        var imgPlaceholder = 'DYNIMG';

        utils.log('toData for ' + self.blockID);

        // get contents of block
        var content = self.getTextBlock().html();

        if (content.length > 0) {

            // get all strings matching a dynamic image from the block content
            var dynamicImageStrings = content.match(/<div\b[^>]*>([\s\S]*?)<\/div>/gm);

            if (dynamicImageStrings) {
                var dynamicImagesInHTML = [];

                // get the ids of the dynamic images in the HTML
                dynamicImageStrings.forEach(function(dynamicImageString) {
                    var dynamicImageId = dynamicImageString.match(/data-sub-block-id="([0-9]+)"/)[1];

                    dynamicImagesInHTML.push(dynamicImageId);

                    // replace each dynamic image string with a custom placeholder DYNIMG{ id of dynamic image }DYNIMG
                    content = content.replace(dynamicImageString, imgPlaceholder + '{' + dynamicImageId + '}' + imgPlaceholder);
                });

                if (dynamicImagesInHTML.length > 0) {
                    // if there are dynamic images, they are obligatorily in the block data store - let's get an array of their ids
                    var storedDynamicImages = Object.keys(self.blockStorage.data.dynamicImages);

                    // get any dynamic images that are in the store but not in the html (i.e images that have been deleted in the editor since they were added)
                    var absentDynamicImages = _.difference(storedDynamicImages, dynamicImagesInHTML);

                    // we delete these references from the dynamicImages store of the block
                    absentDynamicImages.forEach(function(absentDynamicImage) {
                        delete self.blockStorage.data.dynamicImages[absentDynamicImage];
                    });
                }
            }
            // otherwise we need to make sure that any dynamic images that were added are removed
            // this is because we could have added them then deleted them with a keystroke
            else if (self.blockStorage.data && self.blockStorage.data.dynamicImages) {
                delete self.blockStorage.data.dynamicImages;
            }

            // convert remaining text to markdown in the standard sir trevor way
            data.text = stToMarkdown(content, this.type);
        }

        return data;
    },

    loadData: function(data) {
        var self = this;

        if (data.dynamicImages) {
            self.dynamicImages = [];
            var dynamicImagesPromises = [];

            // reinitialiseDynamicImages({
            //     blockRef: self,
            //     dynamicImages: data.dynamicImages
            // })
            // .then(function(dynamicImages) {
            //     self.dynamicImages = dynamicImages;
            // });

            // populate an array of promises; each corresponding to a request for an image
            Object.keys(data.dynamicImages).forEach(function(dynamicImageId) {

                var retrievalUrl = self.globalConfig.apiUrl + '/edt/media/' + dynamicImageId;

                dynamicImagesPromises.push(
                    xhr.get(retrievalUrl, {
                        data: {
                            access_token: self.globalConfig.accessToken
                        }
                    })
                );
            });

            // first, fetch the format data we need to correspond with the format_ids that the api sends us
            imageFormatHelper.fetchFormats({
                apiUrl: self.globalConfig.apiUrl,
                application: self.globalConfig.application,
                accessToken: self.globalConfig.accessToken
            })
            .then(function(formattedData) {
                // store this formatted data on our block
                self.formattedData = formattedData;

                // get the raw image data from the api for each image id saved in block data
                return Promise.all(dynamicImagesPromises);
            })
            .then(function(rawDynamicImageData) {
                // add the formats property to each image with the human readable image formats eg '500x500'
                return rawDynamicImageData.map(function(singleRawDynamicImageData) {
                    return imageFormatHelper.prepareSingleImageFormat(singleRawDynamicImageData.content, self.formattedData.formats);
                });
            })
            .then(function(formattedDynamicImageData) {
                // loop through all formatted data and instantiate dynamicImage subBlocks
                formattedDynamicImageData.forEach(function(singleFormattedDynamicImageData) {
                    self.dynamicImages.push(
                        subBlockManager.buildSingle({
                            accessToken: self.globalConfig.accessToken,
                            apiUrl: self.globalConfig.apiUrl,
                            application: self.globalConfig.application,
                            content: singleFormattedDynamicImageData,
                            parentId: self.blockID,
                            type: 'dynamicImage'
                        })
                    );
                });

                // here we write the html to the block
                self.getTextBlock().html(stToHTML(data.text));

                // we parse the html and create an array of ranges that encompass each placeholder
                // then looping over each array item, we find the corresponding dynamic image
                // we delete the contents of the range
                // we append the instantiated element of the dynamic image
            })
            .catch(function(err) {
                console.error(err);
            });
        }
        else {
            self.getTextBlock().html(stToHTML(data.text));
        }
    }
});
