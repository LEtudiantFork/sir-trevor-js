import xhr from 'etudiant-mod-xhr';

import Block from '../block';
import fieldHelper from '../helpers/field';

import PandoraSearch from '../helpers/pandora-search.class';

const CHOOSEABLE = [
    {
        title: i18n.t('blocks:quiz:title'),
        api: 'quizzes',
        icon: 'quiz',
        name: 'Quiz',
        type: 'quiz'
    },
    {
        title: i18n.t('blocks:personality:title'),
        api: 'personalities',
        icon: 'personality',
        name: 'Personality',
        type: 'personality'
    },
    {
        title: i18n.t('blocks:poll:title'),
        api: 'sondage',
        icon: 'Poll',
        name: 'Poll',
        type: 'poll'
    },
    {
        title: i18n.t('blocks:script:title'),
        icon: 'script',
        name: 'Script',
        type: 'script'
    }
];

module.exports = Block.extend({

    type: 'embed',

    title: () => { return i18n.t('blocks:embed:title'); },

    chooseable: true,

    editorHTML: '<div class="st-block--embed"></div>',

    icon_name: 'insert-template',

    toolbarEnabled: true,
    formatBarEnabled: false,

    onBlockRender() {
        this.createChoices(CHOOSEABLE, choice => {
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
                const options = content.map(({ id: value, label }) => ({ value, label }));

                return fieldHelper.addNullOptionToArray(options, i18n.t('blocks:embed:defaultOption'));
            })
            .then(thematics => {
                const filterConfig = {
                    url: `${this.globalConfig.apiUrl}/jcs/${choice.api}/search`,
                    accessToken: this.globalConfig.accessToken,
                    application: this.globalConfig.application,
                    limit: 20,
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
                    ]
                };

                let pandoraSearch = PandoraSearch.create({
                    container: this.editor,
                    filterConfig,
                    sliderConfig,
                    subBlockType: choice.type
                })
                .once('selected', selected => {
                    const { name } = CHOOSEABLE.find(choice => choice.type === selected.type);
                    this.mediator.trigger('block:replace', this.el, name, selected.content);

                    pandoraSearch.destroy();
                    pandoraSearch = null; // to garbage collect
                });
            })
            .catch(err => console.error(err.stack));
        });
    }
});
