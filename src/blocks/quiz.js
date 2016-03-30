'use strict';

const _     = require('../lodash');
// const Dom   = require('../packages/dom');
const Block = require('../block');

module.exports = Block.extend({

    type: 'quiz',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:quiz:title'); },

    icon_name: 'quiz',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {}
});
