'use strict';

const _     = require('../lodash');
const Block = require('../block');

module.exports = Block.extend({

    type: 'personality',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:personality:title'); },

    icon_name: 'personality',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {}
});
