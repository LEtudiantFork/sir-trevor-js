'use strict';

var Dom = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

  type: "table",
  title: function() { return i18n.t('blocks:table:title'); },

  icon_name: 'table',

  toolbarEnabled: true,
  formatBarEnabled: false,

  loadData: function(data){
    console.log(data);
  },

  onBlockRender: function() {

  }
});
