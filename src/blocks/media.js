'use strict';

var Dom = require('../packages/dom');
var Block = require('../block');

// @todo: this will be the media block, pick an image or a video from médiathèque

module.exports = Block.extend({

  type: "media",

  title: function() { return i18n.t('blocks:media:title'); },

  icon_name: 'Image',

  loadData: function(data){
    console.log(data);
  }
});
