'use strict';

const Block = require('../block');

const fieldHelper = require('../helpers/field');

import xhr from 'etudiant-mod-xhr';

import PandoraSearch from '../helpers/pandora-search.class';

const chooseableConfig = {
    name: 'type',
    options: [
        {
            title: i18n.t('blocks:quiz:title'),
            icon: 'quiz',
            value: 'quiz'
        }, {
            title: i18n.t('blocks:personality:title'),
            icon: 'personality',
            value: 'personality'
        }, {
            title: i18n.t('blocks:poll:title'),
            icon: 'Poll',
            value: 'poll'
        }, {
            title: i18n.t('blocks:script:title'),
            icon: 'script',
            value: 'script'
        }
    ]
};

const apiJCSNames = {
    poll: 'sondage',
    quiz: 'quizzes',
    personality: 'personalities'
};

module.exports = Block.extend({

    type: 'embed',

    title: function() { return i18n.t('blocks:embed:title'); },

    chooseable: true,

    editorHTML: '<div class="st-block--embed"></div>',

    icon_name: 'insert-template',

    toolbarEnabled: true,
    formatBarEnabled: false,

    loadData(data) {
        console.log(data);
    },

    onBlockRender() {
        this.createChoices(chooseableConfig, choices => {
            if (choices.type === 'script') {
                this.mediator.trigger('block:replace', this.el, choices.type, {});
            }

            const thematicOptionsUrl = `${this.globalConfig.apiUrl}/jcs/thematics/list/${choices.type}`;

            const sliderConfig = {
                controls: {
                    next: 'Next',
                    prev: 'Prev'
                },
                itemsPerSlide: 2,
                increment: 2
            };

            xhr.get(thematicOptionsUrl, {
                data: {
                    access_token: this.globalConfig.accessToken
                }
            })
            .then(result => {
                const filterOptions = result.content.map(filterOption => {
                    return {
                        value: filterOption.id,
                        label: filterOption.label
                    };
                });

                return fieldHelper.addNullOptionToArray(filterOptions, 'Aucune Thematique');
            })
            .catch(err => {
                console.error(err);
            })
            .then(thematics => {
                const filterConfig = {
                    url: this.globalConfig.apiUrl + '/jcs/' + apiJCSNames[choices.type] + '/search',
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
                    filterConfig: filterConfig,
                    sliderConfig: sliderConfig,
                    subBlockType: choices.type
                });


                this.pandoraSearch.on('selected', selectedSubBlock => {
                    this.mediator.trigger('block:replace', this.el, selectedSubBlock.type, selectedSubBlock.content);

                    this.pandoraSearch.destroy();
                });
            })
            .catch(function(err) {
                console.error(err);
            });
        });
    }
});
