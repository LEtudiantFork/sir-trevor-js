'use strict';

/*
  Jeux, Concours et Sondages Block
*/

var xhr = require('etudiant-mod-xhr');

var _     = require('../lodash.js');
var Block = require('../block');
var utils = require('../utils');

var SubBlockSearch  = require('../helpers/sub-block-search.class.js');
var subBlockManager = require('../sub_blocks/sub-block-manager.js');

var chooseableConfig = {
    name: 'subBlockType',
    options: [
        {
            title: i18n.t('sub_blocks:embed:poll:title'),
            value: 'poll'
        }, {
            title: i18n.t('sub_blocks:embed:quiz:title'),
            value: 'quiz'
        }, {
            title: i18n.t('sub_blocks:embed:personality:title'),
            value: 'personality'
        }, {
            title: i18n.t('sub_blocks:embed:script:title'),
            value: 'script'
        }
    ]
};

function bindEventsOnScriptSubBlock(block, scriptSubBlock) {
    scriptSubBlock.on('valid', function(scriptBlockData) {
        block.resetErrors();

        block.setData({
            type: 'script',
            content: scriptBlockData
        });
    });

    scriptSubBlock.on('invalid', function() {
        block.setError(scriptSubBlock.$textarea, i18n.t('sub_blocks:embed:script:invalid'));
    });
}

function getPath(subBlockType) {
    switch (subBlockType) {
        case 'poll':
            return 'polls';
            break;
        case 'quiz':
            return 'quizzes';
            break;
        case 'personality':
            return 'personalities';
            break;
        default:
            throw new Error('Unknown sub block type');
            break;
    }
}

function onChoose(choices) {
    var block = this;

    block.subBlockType = choices.subBlockType;

    if (block.subBlockType === 'script') {
        var scriptSubBlock = subBlockManager.buildSingle(block.subBlockType);

        scriptSubBlock.appendTo(this.$editor);

        bindEventsOnScriptSubBlock(this, scriptSubBlock);
    }
    else {
        var thematicOptionsUrl = block.globalConfig.apiUrl + '/jcs/thematics/list/' + getPath(choices.subBlockType);

        var thematicOptionsPromise = xhr.get(thematicOptionsUrl, {
            data: {
                access_token: block.globalConfig.accessToken
            }
        })
        .then(function(result) {
            return result.content.map(function(filterOption) {
                return {
                    value: filterOption.id,
                    label: filterOption.label
                };
            });
        })
        .catch(function(err) {
            console.error(err);
        })
        .then(function(formatedFilterOptions) {
            return {
                name: 'thematic',
                options: formatedFilterOptions
            };
        });

        var filterConfig = {
            url: block.globalConfig.apiUrl + '/jcs/' + getPath(choices.subBlockType) + '/search',
            accessToken: block.globalConfig.accessToken,
            fields: [
                {
                    type: 'search',
                    name: 'query',
                    placeholder: 'Rechercher'
                }, {
                    type: 'select',
                    name: 'thematic',
                    placeholder: 'Thematique',
                    options: thematicOptionsPromise
                }
            ],
            limit: 20,
            container: block.$inner,
            application: block.globalConfig.application
        };

        var sliderConfig = {
            controls: {
                next: 'Next',
                prev: 'Prev'
            },
            itemsPerSlide: 2,
            increment: 2,
            container: block.$inner
        };

        this.subBlockSearch = new SubBlockSearch({
            apiUrl: block.globalConfig.apiUrl,
            block: block,
            filterConfig: filterConfig,
            sliderConfig: sliderConfig
        });

        this.subBlockSearch.on('selected', function(selectedSubBlock) {
            this.setData({
                id: selectedSubBlock.id,
                application: selectedSubBlock.contents.application,
                type: selectedSubBlock.type
            });

            this.slider.destroy();
            this.filterBar.destroy();

            this.$editor.html(selectedSubBlock.renderLarge());
        }.bind(this));
    }
}

module.exports = Block.extend({

    chooseable: true,

    type: 'embed',

    title: i18n.t('blocks:embed:title'),

    editorHTML: '<div class="st-embed-block"></div>',

    icon_name: 'embed',

    loadData: function(data) {
        if (!_.isEmpty(data)) {
            if (data.type === 'script') {
                var scriptSubBlock = subBlockManager.buildSingle(data.type, data.content);

                scriptSubBlock.appendTo(this.$editor);

                bindEventsOnScriptSubBlock(this, scriptSubBlock);
            }
            else {
                this.loading();

                var retrieveUrl = this.globalConfig.apiUrl + '/jcs/' + getPath(data.type) + '/' + data.id + '/' + data.application;

                xhr.get(retrieveUrl, {
                    data: {
                        access_token: this.globalConfig.accessToken
                    }
                })
                .then(function(subBlockData) {
                    var subBlock = subBlockManager.buildSingle(data.type, subBlockData.content);

                    this.$editor.html(subBlock.renderLarge());

                    this.ready();
                }.bind(this))
                .catch(function(err) {
                    throw new Error('No block returned for id:' + this.subBlockData.id + ' on app:' + this.subBlockData.application + ' ' + err);
                }.bind(this));
        }
        }
    },

    onBlockRender: function() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
    }
});
