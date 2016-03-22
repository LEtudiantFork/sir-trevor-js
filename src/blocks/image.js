'use strict';

var _     = require('../lodash');
var Dom   = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

    type: "image",

    toolbarEnabled: false,

    title() { return i18n.t('blocks:image:title'); },

    icon_name: 'Image',

    loadData(data){
    },

    onBlockRender() {
    }
});
