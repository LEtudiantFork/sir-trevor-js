'use strict';

const Block = require('../block');

module.exports = Block.extend({

    type: 'barChart',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:barChart:title'); },

    icon_name: 'bar-chart',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {
    }
});
