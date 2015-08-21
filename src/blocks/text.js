"use strict";

/*
  Text Block
*/

var $             = require('etudiant-mod-dom');
var Block         = require('../block');
var EventBus      = require('../event-bus.js');
var i18n          = require('../i18n-stub.js');
var ImageInserter = require('../helpers/image-inserter.class.js');

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

  scribeOptions: { allowBlockElements: true },

  controllable: true,

  controls: [
        {
            slug: 'show-picture',
            icon: 'image',
            sleep: true,
            eventTrigger: 'click',
            fn: function() {
                var self = this;

                // custom string function
                function indexOfEnd(string, startingIndex = 0) {
                    var io = this.indexOf(string, startingIndex);
                    return io == -1 ? -1 : io + string.length;
                }

                function injectImageMarkup(blockHTML) {
                    var markerIndex = blockHTML.indexOf('scribe-marker');

                    var nextIndex = Math.min(indexOfEnd.call(blockHTML, '</p>', markerIndex), indexOfEnd.call(blockHTML, '<p>', markerIndex));

                    var firstPart = blockHTML.slice(0, nextIndex);
                    var secondPart = blockHTML.slice(nextIndex, blockHTML.length);

                    firstPart += [
                        '<figure data-sub-block-in-block="282765" class="st-sub-block-align-right">',
                            '<img src="http://static.letudiant.lk/ETU_ETU/6/5/282765-telechargement-original.jpeg">',
                            '<figcaption>282765</figcaption>',
                        '</figure>'
                    ].join('\n');

                    return firstPart + secondPart;
                }

                function cleanScribeMarker(string) {
                    return string.replace(/<em class="scribe-marker"[^>]*>[^<]*<\/em>/, '');
                }

                ImageInserter.awaitClick(self.editor, function() {
                    var selection = new self._scribe.api.Selection();
                    selection.placeMarkers();

                    var html = self._scribe.getHTML();

                    html = injectImageMarkup(html);
                    html = cleanScribeMarker(html)

                    self._scribe.setHTML(html);

                    /** /
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
                    /**/
                });
            }
        },
        {
            slug: 'framed',
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
            html:
                `<select>
                    <option selected disabled value"">${ i18n.t('framed:choose') }</option>
                    <option value="false">${ i18n.t('framed:no_style') }</option>
                    <option value="${ framedConfig.blue.value }">${ framedConfig.blue.label }</option>
                    <option value="${ framedConfig.red.value }">${ framedConfig.red.label }</option>
                    <option value="${ framedConfig.green.value }">${ framedConfig.green.label }</option>
                </select>`
        }
    ],

  title: function() { return i18n.t('blocks:text:title'); },

  editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',

  icon_name: 'text',

  loadData: function(data){
    // @dev
    window.textBlock = this;

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
      this.setTextBlockHTML(data.text);
    }

    if (data.framed) {
        this.editor.classList.add('st-framed-' + data.framed);
    }
  },
});
