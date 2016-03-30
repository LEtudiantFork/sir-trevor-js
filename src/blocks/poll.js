'use strict';

const _     = require('../lodash');
// const Dom   = require('../packages/dom');
const Block = require('../block');

module.exports = Block.extend({

    type: 'poll',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:poll:title'); },

    icon_name: 'poll',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {}
});

