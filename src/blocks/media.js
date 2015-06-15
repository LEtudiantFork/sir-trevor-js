'use strict';

/*
  Media block - images et vidéos
*/

var xhr = require('etudiant-mod-xhr');

var $ = require('jquery');
var _ = require('../lodash.js');
var Block = require('../block');

var SubBlockSearch = require('../helpers/sub-block-search.class.js');

var chooseableConfig = {
    name: 'contentType',
    options: [
        {
            title: i18n.t('sub_blocks:image'),
            value: 'image'
        }, {
            title: i18n.t('sub_blocks:video'),
            value: 'video'
        }
    ]
};

function onChoose(choices) {
    var block = this;

    block.subBlockType = choices.contentType;

    var categoryOptionsUrl = block.globalConfig.apiUrl + 'edt/' + block.type + '/filters/' + block.globalConfig.application;

    var categoryOptionsPromise = xhr.get(categoryOptionsUrl)
        .then(function(result) {
            return result.content.categories.map(function(category) {
                return {
                    value: category.id,
                    label: category.label
                };
            });
        })
        .catch(function(err) {
            console.error(err);
        })
        .then(function(formattedCategories) {
            return {
                name: 'category',
                options: formattedCategories
            };
        });

    var filterConfig = {
        url: block.globalConfig.apiUrl + 'edt/' + block.type,
        fields: [
            {
                type: 'search',
                name: 'query',
                placeholder: 'Rechercher'
            }, {
                type: 'select',
                name: 'category',
                placeholder: 'Category',
                options: categoryOptionsPromise
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

    this.subBlockSearch.on('ready', function() {
        console.log('subBlockSearch triggered ready');
        this.$inner.prepend(this.$inputs);
    }.bind(this));

    this.subBlockSearch.on('selected', function(selectedSubBlock) {
        this.setData(selectedSubBlock.contents);

        this.slider.destroy();
        this.filterBar.destroy();

        this.$editor.html(selectedSubBlock.renderLarge());
    }.bind(this));
}


module.exports = Block.extend({
    type: 'media',

    title: function() {
        return i18n.t('blocks:medias:title');
    },

    chooseable: true,
    droppable: true,
    uploadable: true,

    icon_name: 'image',

    editorHTML: '<div class="st-medias-block"></div>',

    loadData: function(data) {
        if (!_.isEmpty(data)) {
            this.loading();

            var retrieveUrl = this.globalConfig.apiUrl + this.type + '/' + data.type + '/' + data.id + '/' + data.application;

            xhr.get(retrieveUrl)
                .then(function(subBlockData) {
                    var subBlock = subBlockManager.buildSingle(this.type, subBlockData.content, data.type);

                    this.$editor.html(subBlock.renderLarge());

                    this.ready();
                }.bind(this))
                .catch(function(err) {
                    throw new Error('No block returned for id:' + this.subBlockData.id + ' on app:' + this.subBlockData.application + ' ' + err);
                }.bind(this));


            // this.$editor.html($('<img>', {
            //     src: data.file.url
            // }));
        }
    },

    onBlockRender: function() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.$inputs.detach();

            this.$inputs.find('input').on('change', (function(ev) {
                this.onDrop(ev.currentTarget);
            }).bind(this));

            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
    },

    onDrop: function(transferData) {
        var file = transferData.files[0];
        var urlAPI = (typeof window.URL !== 'undefined') ? window.URL : (typeof window.webkitURL !== 'undefined') ? window.webkitURL : null;

        // Handle one upload at a time
        if (/image/.test(file.type)) {
            this.loading();
            // Show this image on here
            this.$inputs.hide();
            this.$editor.html($('<img>', {
                src: urlAPI.createObjectURL(file)
            })).show();

            this.uploader(
                file,
                function(data) {
                    this.setData(data);
                    this.ready();
                },
                function(error) {
                    this.addMessage(i18n.t('blocks:image:upload_error'));
                    this.ready();
                    console.error(error);
                }
            );
        }
    }
});
