'use strict';

var _     = require('../lodash');
var Dom   = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

    type: "pieChart",

    toolbarEnabled: false,

    title() { return i18n.t('blocks:pieChart:title'); },

    icon_name: 'pie-chart',

    loadData(data){
    },

    onBlockRender() {
    }
});