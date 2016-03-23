'use strict';

var _     = require('../lodash');
var Block = require('../block');

var fieldHelper       = require('../helpers/field');
var imageFilterHelper = require('../helpers/image-filter');

import SubBlockSearch from '../helpers/sub-block-search.class';

var chooseableConfig = {
    name: 'type',
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

    type: 'media',

    title() { return i18n.t('blocks:media:title'); },

    chooseable: true,

    icon_name: 'Image',

    onBlockRender() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, choices => {
                console.log('The following things were chosen ', choices);

                var block = this;

                var sliderConfig = {
                    controls: {
                        next: 'Next',
                        prev: 'Prev'
                    },
                    itemsPerSlide: 2,
                    increment: 2
                };

                imageFilterHelper.getFilterData({
                    apiUrl: block.globalConfig.apiUrl,
                    application: block.globalConfig.application,
                    accessToken: block.globalConfig.accessToken
                })
                .then(function(filterData) {

                    var filterConfig = {
                        url: block.globalConfig.apiUrl + '/edt/media',
                        accessToken: block.globalConfig.accessToken,
                        fields: [
                            {
                                type: 'search',
                                name: 'query',
                                placeholder: 'Rechercher'
                            }, {
                                type: 'select',
                                name: 'category',
                                placeholder: 'Categorie',
                                options: fieldHelper.addNullOptionToArray(filterData.categories, 'Aucune categorie')
                            }
                        ],
                        limit: 20,
                        application: block.globalConfig.application,
                        type: choices.type
                    };

                    block.subBlockSearch = SubBlockSearch.create({
                        application: block.globalConfig.application,
                        accessToken: block.globalConfig.accessToken,
                        apiUrl: block.globalConfig.apiUrl,
                        container: block.editor,
                        filterConfig: filterConfig,
                        sliderConfig: sliderConfig,
                        subBlockType: choices.type
                    });

                    block.subBlockSearch.on('selected', function(selectedSubBlock) {
                        block.setData({
                            id: selectedSubBlock.id,
                            type: selectedSubBlock.type
                        });

                        block.subBlockSearch.destroy();

                        block.editor.appendChild(selectedSubBlock.renderLarge()[0]);

                        selectedSubBlock.on('save', function(newData) { block.setData(newData); });
                    });
                })
                .catch(function(err) {
                    console.error(err);
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
