"use strict";

/*
  Text Block
*/

var $             = require('etudiant-mod-dom');
var Block         = require('../block');
var EventBus      = require('../event-bus.js');
var i18n          = require('../i18n-stub.js');
var ImageInserter = require('../helpers/image-inserter.class.js');
var stToHTML      = require('../to-html');

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
};

module.exports = Block.extend({

  type: "text",

  controllable: true,

  controls: [
        {
            slug: 'show-picture',
            icon: 'image',
            sleep: true,
            eventTrigger: 'click',
            fn: function() {
                var self = this;

                ImageInserter.awaitClick(self.editor, function(insertionPoint) {
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
            icon: 'p',
            eventTrigger: 'change',
            fn: function(e) {
                e.preventDefault();

                var result = e.target.value;

                $(this.editor).removeClassByPrefix('st-framed');

                if (result !== 'false') {
                    this.editor.classList.add('st-framed-' + result);
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

  title: function() { return i18n.t('blocks:text:title'); },

  editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',

  icon_name: 'text',

  loadData: function(data){

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
        if (this.options.convertFromMarkdown && data.format !== "html") {
          this.setTextBlockHTML(stToHTML(data.text, this.type));
        } else {
          this.setTextBlockHTML(data.text);
        }
    }

    if (data.framed) {
        this.editor.classList.add('st-framed-' + data.framed);
    }
  },
});
