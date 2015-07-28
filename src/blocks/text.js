/*
  Text Block
*/

var Block                 = require('../block');
var contentEditableHelper = require('../helpers/content-editable-helper.js');
var ImageInserter         = require('../helpers/image-inserter.class.js');
var stToHTML              = require('../to-html');
var subBlockManager       = require('../sub_blocks/sub-block-manager.js');

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
                var self = this;

                // check if image inserter is waiting for a click
                if (!this.imageInsertAwaitingClick) {
                    this.imageInsertAwaitingClick = true;

                    // use static class method to return callback with insertion point on click in editable area of block
                    ImageInserter.getInsertionPoint(this.getTextBlock(), function(insertionPoint) {
                        self.imageInsertAwaitingClick = false;

                        // check if image inserter is instantiated
                        ImageInserter.isInstantiated(self.imageInserter)
                            .then(function() {
                                // if it's instantiated, we can open the image inserter straight away
                                self.imageInserter.open();
                            })
                            .catch(function() {
                                // if not, we have to instantiate it
                                self.imageInserter = new ImageInserter({
                                    accessToken: self.globalConfig.accessToken,
                                    apiUrl: self.globalConfig.apiUrl,
                                    application: self.globalConfig.application,
                                    blockRef: self,
                                    subBlockType: 'dynamicImage'
                                });

                                // once it's ready, then we can open it
                                self.imageInserter.once('ready', function() {
                                    self.imageInserter.open();
                                });
                            })
                            // as this follows the above then/catch, it will always run
                            .then(function() {
                                // in case we closed the modal, we need to clear the onSelected
                                self.imageInserter.clearOnSelected();

                                // we set a listener for the onSelected behaviour
                                self.imageInserter.once('selected', function(dynamicImage) {
                                    // static method to insert the element at the insertionPoint
                                    ImageInserter.insertImage(insertionPoint, dynamicImage.renderInBlock().get(0));
                                });
                            });
                    });
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

    loadData: function(data) {
        // @todo:
        this.getTextBlock().html(stToHTML(data.text));
    }
});
