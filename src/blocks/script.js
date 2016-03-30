'use strict';

const _     = require('../lodash');
// const Dom   = require('../packages/dom');
const Block = require('../block');

module.exports = Block.extend({

    type: 'script',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:script:title'); },

    icon_name: 'script',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {}
});
