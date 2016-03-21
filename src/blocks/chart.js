'use strict';

var Dom = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

  type: "chart",
  title: function() { return i18n.t('blocks:chart:title'); },

  icon_name: 'pie-chart',

  toolbarEnabled: true,
  formatBarEnabled: false,

  loadData: function(data){
    console.log(data);
  },

  onBlockRender: function() {

  }
});
