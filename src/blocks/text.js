/*
  Text Block
*/

var Block                 = require('../block');
var contentEditableHelper = require('../helpers/content-editable-helper.js');
var EventBus              = require('../event-bus.js');
var ImageInserter         = require('../helpers/image-inserter.class.js');
var stToHTML              = require('../to-html');
var utils                 = require('../utils.js');
var stToMarkdown          = require('../to-markdown.js');

module.exports = Block.extend({

    type: 'text',

    title: function() {
        return i18n.t('blocks:text:title');
    },

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
                var self = this;

                ImageInserter.awaitClick(self.getTextBlock(), function(insertionPoint) {
                    ImageInserter.init(self)
                        .then(function() {
                            self.imageInserter.openSearch();

                            // here we know that the imageinserter is initialised
                            EventBus.on('editImage', function(dynamicImage) {
                                if (dynamicImage.parentID === self.imageInserter.subBlockSearch.id) {
                                    var shouldReplace = true;
                                    self.imageInserter.editImage(dynamicImage, shouldReplace);
                                }
                            });

                            self.imageInserter.once('selected', function(dynamicImage) {
                                ImageInserter.saveDynamicImage(self.blockStorage.data, dynamicImage);

                                // static method to insert the element at the insertionPoint
                                ImageInserter.insertImage(insertionPoint, dynamicImage.renderInBlock());
                            });
                        });
                });
            }
        }
        // @todo repair this functionality
        // {
        //     slug: 'add-paragraph',
        //     icon: 'Paragraph', // @todo find a proper icon for this
        //     sleep: true,
        //     eventTrigger: 'click',
        //     fn: function() {
        //         contentEditableHelper.splitContentAtCaret(this.getTextBlock(), function(firstParagraph, secondParagraph) {
        //             // @todo: as this creates just a 'string', we need to go back through the method
        //             this.getTextBlock().html(firstParagraph);

        //             // create a second block with the same content as the last
        //             this.mediator.trigger('block:create', 'text', {
        //                 text: secondParagraph
        //             });
        //         }.bind(this));
        //     }
        // }
    ],

    onBlockRender: function() {
        contentEditableHelper.normaliseNewLine(this.getTextBlock());
    },

    _serializeData: function() {
        var self = this;
        var data = {};

        utils.log('toData for ' + self.blockID);

        // get contents of block
        var textContent = self.getTextBlock().html();

        if (textContent.length > 0) {

            var parsedBlockContent = ImageInserter.checkForDynamicImageStrings(textContent, self.blockStorage.data)

            data.text = stToMarkdown(parsedBlockContent.textContent, this.type);
            self.blockStorage.data = parsedBlockContent.blockStore;

            if (!parsedBlockContent) {
                delete self.blockStorage.data.dynamicImages;
                data.text = stToMarkdown(textContent, this.type);
            }
        }

        return data;
    },

    loadData: function(data) {
        var self = this;

        if (data.dynamicImages) {
            self.loading();
            self.getTextBlock().hide();

            ImageInserter.init(self)
                .then(function() {
                    return self.imageInserter.reinitialiseImages({
                        block: self,
                        storedData: {
                            dynamicImages: data.dynamicImages,
                            text: data.text
                        }
                    });
                })
                .then(function(result) {
                    self.dynamicImages = result.dynamicImages;

                    self.getTextBlock().html(stToHTML(result.text));

                    self.dynamicImages.forEach(function(dynamicImage) {
                        dynamicImage.replaceRenderedInBlock();
                    });

                    // here we know that the imageinserter is initialised
                    EventBus.on('editImage', function(dynamicImage) {
                        if (dynamicImage.parentID === self.blockID) {
                            var shouldReplace = true;
                            self.imageInserter.editImage(dynamicImage, shouldReplace);
                        }
                    });

                    self.getTextBlock().show();

                    // prepare behaviour for an image that has already been added but is then altered
                    self.imageInserter.on('replace', function(dynamicImage) {
                        ImageInserter.saveDynamicImage(self.blockStorage.data, dynamicImage);

                        dynamicImage.replaceRenderedInBlock();
                    });
                })
                .catch(function(error) {
                    console.error(error);
                });
        }
        else {
            self.getTextBlock().html(stToHTML(data.text));
        }
    }
});
