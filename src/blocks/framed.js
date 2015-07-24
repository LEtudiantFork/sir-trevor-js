'use strict';

/*
  Framed
*/

var $               = require('jquery');
var _               = require('../lodash.js');
var Block           = require('../block');
var ImageInserter   = require('../helpers/image-inserter.class.js');
var stToHTML        = require('../to-html');
var subBlockManager = require('../sub_blocks/sub-block-manager.js');
var xhr             = require('etudiant-mod-xhr');

module.exports = Block.extend({
    type: 'framed',

    title: i18n.t('blocks:framed:title'),

    icon_name: 'framed',

    controllable: true,
    formattable: true,

    editorHTML: '<div class="st-text-block" contenteditable="true"></div>',

    controls_position: 'bottom',
    controls_visible: true,

    controls: [
        {
            slug: 'show-picture',
            'icon': 'image',
            eventTrigger: 'click',
            fn: function() {
                if (!this.imageInserter) {
                    this.imageInserter = new ImageInserter({
                        accessToken: this.globalConfig.accessToken,
                        apiUrl: this.globalConfig.apiUrl,
                        application: this.globalConfig.application,
                        blockRef: this,
                        subBlockType: 'dynamicImage'
                    });
                }

                this.imageInserter.open();
            }
        }

    ],

    onBlockRender: function() {

    },

    loadData: function(data){

    },

    toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg, '$1');
    }
});
