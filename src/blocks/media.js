'use strict';

const _     = require('../lodash');
const Block = require('../block');

const fieldHelper = require('../helpers/field');

import filterDataFetcher from '../helpers/filter-data-fetcher';
import PandoraSearch from '../helpers/pandora-search.class';

const chooseableConfig = {
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

const subBlockTrevorMap = {
    image: 'Image',
    video: 'Video',
    diaporama: 'Diaporama'
};

module.exports = Block.extend({

    type: 'media',

    title() { return i18n.t('blocks:media:title'); },

    chooseable: true,

    icon_name: 'Image',

    onBlockRender() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, choices => {
                const sliderConfig = {
                    controls: {
                        next: 'Next',
                        prev: 'Prev'
                    },
                    itemsPerSlide: 2,
                    increment: 2
                };

                filterDataFetcher.getData({ // @todo put inside a service
                    apiUrl: this.globalConfig.apiUrl,
                    application: this.globalConfig.application,
                    accessToken: this.globalConfig.accessToken
                })
                .then(filterData => {

                    let filterConfig = {
                        url: this.globalConfig.apiUrl + '/edt/media',
                        accessToken: this.globalConfig.accessToken,
                        application: this.globalConfig.application,
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
                        type: choices.type
                    };

                    this.pandoraSearch = PandoraSearch.create({
                        container: this.editor,
                        filterConfig: filterConfig,
                        sliderConfig: sliderConfig,
                        subBlockType: choices.type
                    });

                    this.pandoraSearch.on('selected', selectedSubBlock => {
                        this.mediator.trigger('block:replace', this.el, subBlockTrevorMap[selectedSubBlock.type], selectedSubBlock.content);

                        this.pandoraSearch.destroy();
                    });
                })
                .catch(function(err) {
                    console.error(err);
                });

            });
        }
    }
});
