'use strict';

const Block = require('../block');

module.exports = Block.extend({

    type: 'image',

    toolbarEnabled: false,

    editorHTML: '<div class="st-block--image" contenteditable="true"></div>',

    title() { return i18n.t('blocks:image:title'); },

    icon_name: 'Image',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {
    }
});
