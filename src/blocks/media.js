/*
    Media selector Block
*/

import xhr from 'etudiant-mod-xhr';

import Block from '../block';
import fieldHelper from '../helpers/field';

import filterDataFetcher from '../helpers/filter-data-fetcher';
import PandoraSearch from '../helpers/pandora-search.class';

const CHOOSEABLE = [
    {
        title: i18n.t('blocks:image:title'),
        icon: 'Image',
        name: 'Image',
        type: 'image'
    }, {
        title: i18n.t('blocks:video:title'),
        icon: 'Video',
        name: 'Video',
        type: 'video'
    }, {
        title: i18n.t('blocks:diaporama:title'),
        api: '/edt/media/',
        icon: 'Diaporama',
        name: 'Diaporama',
        type: 'diaporama'
    }
];

export default Block.extend({

    type: 'media',

    title: () => i18n.t('blocks:media:title'),

    'icon_name': 'Image',

    chooseable: true,

    onBlockRender() {
        this.createChoices(CHOOSEABLE, choice => {
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

                const filterConfig = {
                    url: `${ this.globalConfig.apiUrl }/edt/media`,
                    accessToken: this.globalConfig.accessToken,
                    application: this.globalConfig.application,
                    limit: 20,
                    type: choice.type,
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
                    ]
                };

                let pandoraSearch = PandoraSearch.create({
                    container: this.editor,
                    filterConfig,
                    sliderConfig,
                    subBlockType: choice.type
                });

                const done = (name, data) => {
                    this.mediator.trigger('block:replace', this.el, name, data);

                    pandoraSearch.destroy();
                    pandoraSearch = null; // to garbage collect
                };

                pandoraSearch.once('selected', selected => {
                    const { name, api } = CHOOSEABLE.find(choice => choice.type === selected.type);

                    if (!api) {
                        done(name, selected.content);
                    }
                    else {
                        xhr.get(`${ this.globalConfig.apiUrl }${ api }${ selected.id }`, {
                            data: {
                                access_token: this.globalConfig.accessToken
                            }
                        })
                        .then(({ content = {} }) => done(name, content));
                    }
                });
            })
            .catch((err) => console.error(err.stack));
        });
    }
});
