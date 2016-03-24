'use strict';

const Block = require('../block');

module.exports = Block.extend({

    type: 'diaporama',

    toolbarEnabled: false,

    editorHTML: '<div class="st-block--diaporama"></div>',

    title() { return i18n.t('blocks:diaporama:title'); },

    icon_name: 'Diaporama',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {
    }
});
