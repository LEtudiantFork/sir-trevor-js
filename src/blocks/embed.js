import Block from '../block';
import fieldHelper from '../helpers/field';

import xhr from 'etudiant-mod-xhr';

import PandoraSearch from '../helpers/pandora-search.class';

const CHOICES = {
    name: 'type',
    options: [
        {
            title: i18n.t('blocks:quiz:title'),
            icon: 'quiz',
            value: 'quiz',
            api: 'quizzes'
        },
        {
            title: i18n.t('blocks:personality:title'),
            icon: 'personality',
            value: 'personality',
            api: 'personalities'
        },
        {
            title: i18n.t('blocks:poll:title'),
            icon: 'Poll',
            value: 'poll',
            api: 'sondage'
        },
        {
            title: i18n.t('blocks:script:title'),
            icon: 'script',
            value: 'script'
        }
    ]
};

module.exports = Block.extend({

    type: 'embed',

    title: () => { return i18n.t('blocks:embed:title'); },

    chooseable: true,

    editorHTML: '<div class="st-block--embed"></div>',

    icon_name: 'insert-template',

    toolbarEnabled: true,
    formatBarEnabled: false,

    loadData(data) {
        console.log(data);
    },

    onBlockRender() {
        this.createChoices(CHOICES, choice => {
            if (choice.type === 'script') {
                this.mediator.trigger('block:replace', this.el, choice.type, {});
                return;
            }

            const thematicOptionsUrl = `${this.globalConfig.apiUrl}/jcs/thematics/list/${choice.api}`;

            const sliderConfig = {
                controls: {
                    next: i18n.t('blocks:embed:next'),
                    prev: i18n.t('blocks:embed:prev')
                },
                itemsPerSlide: 2,
                increment: 2
            };

            xhr.get(thematicOptionsUrl, {
                data: {
                    access_token: this.globalConfig.accessToken
                }
            })
            .then(({ content = [] }) => {
                const filterOptions = content.map(({ id: value, label }) => ({ value, label }));

                return fieldHelper.addNullOptionToArray(filterOptions, i18n.t('blocks:embed:defaultOption'));
            })
            .then(thematics => {
                const filterConfig = {
                    url: `${this.globalConfig.apiUrl}/jcs/${choice.api}/search`,
                    accessToken: this.globalConfig.accessToken,
                    fields: [
                        {
                            type: 'search',
                            name: 'query',
                            placeholder: 'Rechercher'
                        }, {
                            type: 'select',
                            name: 'thematic',
                            placeholder: 'Thematique',
                            options: thematics
                        }
                    ],
                    limit: 20,
                    application: this.globalConfig.application
                };

                this.pandoraSearch = PandoraSearch.create({
                    container: this.editor,
                    filterConfig,
                    sliderConfig,
                    subBlockType: choice.type
                });


                this.pandoraSearch.on('selected', selectedSubBlock => {
                    this.mediator.trigger('block:replace', this.el, selectedSubBlock.type, selectedSubBlock.content);

                    this.pandoraSearch.destroy();
                });
            })
            .catch(err => console.error(err));
        });
    }
});
