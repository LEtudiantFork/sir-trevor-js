'use strict';

/*
  Text Block
*/

var $               = require('jquery');
var _               = require('../lodash.js');
var Block           = require('../block');
var ImageInserter   = require('../helpers/image-inserter.class.js');
var stToHTML        = require('../to-html');
var subBlockManager = require('../sub_blocks/sub-block-manager.js');

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
            fn: function(e) {
                if (!this.imageInserter) {
                    this.imageInserter = new ImageInserter({
                        accessToken: this.globalConfig.accessToken,
                        apiUrl: this.globalConfig.apiUrl,
                        application: this.globalConfig.application,
                        blockRef: this,
                        subBlockType: 'dynamicImage'
                    });

                    this.imageInserter.on('imageSelected', function(selectedImage) {
                        // do summat yeah?
                    });
                }

                this.imageInserter.open();
            }
        },
        {
            slug: 'add-paragraph',
            icon: 'Paragraph', // @todo find a proper icon for this
            sleep: true,
            eventTrigger: 'click',
            fn: function(e) {
                // contentEditableHelper.updateSelection(sel, range);

                // var firstParagraph = contentEditableHelper.getSelectedContent(block);
                // var secondParagraph = contentEditableHelper.getTextAfterParagraph(block, firstParagraph)

                // this.getTextBlock().html(firstParagraph); // will this be compatible with filteredimages ?

                // this.mediator.trigger('block:create', 'text', {
                //     text: secondParagraph
                // });
            }
        }
    ],

    loadData: function(data) {
        this.getTextBlock().html(stToHTML(data.text));
    }
});
