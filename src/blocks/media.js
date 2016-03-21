'use strict';

var _     = require('../lodash');
var Dom   = require('../packages/dom');
var Block = require('../block');

var chooseableConfig = {
    name: 'subBlockType',
    options: [
        {
            title: 'Image',
            icon: 'Image',
            value: 'image'
        }, {
            title: 'Vidéo',
            icon: 'Video',
            value: 'video'
        }, {
            title: 'Diaporama',
            icon: 'Diaporama',
            value: 'diaporama'
        }
    ]
};

module.exports = Block.extend({

    type: "media",

    title: function() { return i18n.t('blocks:media:title'); },

    chooseable: true,

    icon_name: 'Image',

    loadData: function(data){
        console.log(data);
    },

    onBlockRender: function() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, choices => {
                console.log('The following things were chosen ', choices);
            });
        }
    }
});
