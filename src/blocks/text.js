/*
  Text Block
*/

var Block                 = require('../block');
var contentEditableHelper = require('../helpers/content-editable.js');
var EventBus              = require('../event-bus.js');
var FramedHelper          = require('../helpers/framed.js');
var ImageInserter         = require('../helpers/image-inserter.class.js');
var stToHTML              = require('../to-html');
var utils                 = require('../utils.js');
var stToMarkdown          = require('../to-markdown.js');

var framedConfig = {
    blue: {
        label: 'bleu',
        value: 'blue'
    },
    red: {
        label: 'rouge',
        value: 'red'
    },
    green: {
        label: 'vert',
        value: 'green'
    }
}

module.exports = Block.extend({

    type: 'text',

    title: function() {
        return i18n.t('blocks:text:title');
    },

    controllable: true,
    formattable: true,

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
                            // here we know that the imageinserter is initialised
                            self.imageInserter.openSearch();

                            EventBus.on('editImage', function(dynamicImage) {
                                if (dynamicImage.parentID === self.imageInserter.subBlockSearch.id) {
                                    var shouldReplace = true;
                                    self.imageInserter.editImage(dynamicImage, shouldReplace);
                                }
                            });

                            self.imageInserter.on('selected', function(dynamicImage) {
                                ImageInserter.saveImage(self.blockStorage.data, dynamicImage);

                                // static method to insert the element at the insertionPoint
                                ImageInserter.insertImage(insertionPoint, dynamicImage.renderInBlock());
                            });

                            self.imageInserter.on('replace', function(dynamicImage) {
                                ImageInserter.saveImage(self.blockStorage.data, dynamicImage);

                                dynamicImage.replaceRenderedInBlock();
                            });
                        });
                });
            }
        },
        {
            slug: 'framed',
            eventTrigger: 'change',
            fn: function(e) {
                e.preventDefault();

                var result = e.target.value;

                this.getTextBlock().removeClass (function (index, css) {
                    return (css.match (/(^|\s)st-framed-\S+/g) || []).join(' ');
                });

                if (result !== 'false') {
                    this.getTextBlock().addClass('st-framed-' + result);
                }

                this.setData({
                    framed: result
                });
            },
            html: [
                '<select>',
                    '<option selected disabled value"">' + i18n.t('framed:choose') + '</option>',
                    '<option value="false">' + i18n.t('framed:no_style') + '</option>',
                    '<option value="' + framedConfig.blue.value + '">' + framedConfig.blue.label + '</option>',
                    '<option value="' + framedConfig.red.value + '">' + framedConfig.red.label + '</option>',
                    '<option value="' + framedConfig.green.value + '">' + framedConfig.green.label + '</option>',
                '</select>'
            ].join('\n')
        }
    ],

    onBlockRender: function() {
        contentEditableHelper.normaliseNewLine(this.getTextBlock());
    },

    _serializeData: function() {
        var self = this;
        var data = {};

        utils.log('toData for ' + self.blockID);

        var textContent = self.getTextBlock().html();

        if (textContent.length > 0) {

            var extractedContent = ImageInserter.extractContent(textContent, self.blockStorage.data.dynamicImages);

            data.text = stToMarkdown(extractedContent.textContent, this.type);
            data.dynamicImages = extractedContent.dynamicImages;
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
                        ImageInserter.saveImage(self.blockStorage.data, dynamicImage);

                        dynamicImage.replaceRenderedInBlock();
                    });
                })
                .catch(function(error) {
                    console.error(error);
                });
        }
        else {
            this.getTextBlock().html(stToHTML(data.text));
        }

        if (data.framed) {
            this.getTextBlock().addClass('st-framed-' + data.framed);
        }
    }
});
