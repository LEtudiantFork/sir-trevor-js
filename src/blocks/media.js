import Block from '../block';
import fieldHelper from '../helpers/field';

import filterDataFetcher from '../helpers/filter-data-fetcher';
import PandoraSearch from '../helpers/pandora-search.class';

const CHOICES = {
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

const subBlockMap = {
    image: 'Image',
    video: 'Video',
    diaporama: 'Diaporama'
};

module.exports = Block.extend({

    type: 'media',

    title: () => i18n.t('blocks:media:title'),

    chooseable: true,

    icon_name: 'Image',

    onBlockRender() {
        this.createChoices(CHOICES, choice => {
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

                const pandoraSearch = PandoraSearch.create({
                    container: this.editor,
                    filterConfig,
                    sliderConfig,
                    subBlockType: choice.type
                })
                .on('selected', selectedSubBlock => {
                    this.mediator.trigger('block:replace', this.el, subBlockMap[selectedSubBlock.type], selectedSubBlock.content);

                    pandoraSearch.destroy();
                });
            })
            .catch((err) => console.error(err));
        });
    }
});
