'use strict';

const Block = require('../block');

module.exports = Block.extend({

    type: 'diaporama',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:diaporama:title'); },

    icon_name: 'Diaporama',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {
    }
});
