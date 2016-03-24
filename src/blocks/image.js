'use strict';

const Block = require('../block');

module.exports = Block.extend({

    type: 'image',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:image:title'); },

    icon_name: 'Image',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {
    }
});
