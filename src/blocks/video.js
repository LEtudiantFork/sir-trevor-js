'use strict';

var _     = require('../lodash');
var Dom   = require('../packages/dom');
var Block = require('../block');

// @todo use etudiant-mod-video

module.exports = Block.extend({

    type: 'video',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:video:title'); },

    icon_name: 'Video',

    loadData(data){
    },

    onBlockRender() {
    }
});
