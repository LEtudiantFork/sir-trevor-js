'use strict';

var _     = require('../lodash');
var Dom   = require('../packages/dom');
var Block = require('../block');

var chooseableConfig = {
    name: 'subBlockType',
    options: [
        {
            title: i18n.t('blocks:image:title'),
            icon: 'Image',
            value: 'image'
        }, {
            title: i18n.t('blocks:video:title'),
            icon: 'Video',
            value: 'video'
        }, {
            title: i18n.t('blocks:diaporama:title'),
            icon: 'Diaporama',
            value: 'diaporama'
        }
    ]
};

module.exports = Block.extend({

    type: "media",

    title() { return i18n.t('blocks:media:title'); },

    chooseable: true,

    icon_name: 'Image',

    loadData(data){
        console.log(data);
    },

    onBlockRender() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, choices => {
                console.log('The following things were chosen ', choices);

                this.pandoraSearch = PandoraSearch.create({
                    apiUrl: '',
                    type: choices.subBlockType
                });

                // if (choices.subBlockType && choices.subBlockType === 'image') {
                //     this.mediator.trigger("block:replace", this.el, 'Image', {});
                // }
                // else if (choices.subBlockType && choices.subBlockType === 'video') {
                //     this.mediator.trigger("block:replace", this.el, 'Video', {});
                // }
                // else if (choices.subBlockType && choices.subBlockType === 'diaporama') {
                //     this.mediator.trigger("block:replace", this.el, 'Diaporama', {});
                // }
            });
        }
    }
});
