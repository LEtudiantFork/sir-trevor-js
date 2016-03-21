'use strict';

var Dom = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

  type: "jcs",
  title: function() { return i18n.t('blocks:jcs:title'); },

  icon_name: 'jcs',

  toolbarEnabled: true,
  formatBarEnabled: false,

  loadData: function(data){
    console.log(data);
  },

  onBlockRender: function() {

  }
});
