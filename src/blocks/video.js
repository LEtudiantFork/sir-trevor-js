'use strict';

var Block = require('../block');

// @todo use etudiant-mod-video

module.exports = Block.extend({

    type: 'video',

    editorHTML: '<div class="st-block-video"></div>',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:video:title'); },

    icon_name: 'Video',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {
    }
});
