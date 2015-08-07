/*
  Media block - images et vidéos
*/

var $   = require('jquery');
var xhr = require('etudiant-mod-xhr');

var _     = require('../lodash.js');
var Block = require('../block');
var utils = require('../utils');

var fieldHelper = require('../helpers/field.js');

var SubBlockSearch = require('../helpers/sub-block-search.class.js');
var subBlockManager = require('../sub_blocks/manager.js');

var imageFilterHelper = require('../helpers/image-filter.js');

var chooseableConfig = {
    name: 'subBlockType',
    options: [
        {
            title: i18n.t('sub_blocks:media:image:title'),
            value: 'image'
        }, {
            title: i18n.t('sub_blocks:media:video:title'),
            value: 'video'
        }, {
            title: i18n.t('sub_blocks:media:diapo:title'),
            value: 'diaporama'
        }
    ]
};

function prepareCopyrights(copyrights) {
    return copyrights.map(function(copyright) {
        return {
            value: copyright.id,
            label: copyright.name
        };
    });
}

function prepareCategories(categories) {
    return categories.map(function(category) {
        return {
            value: category.id,
            label: category.label
        };
    });
}

function onChoose(choices) {
    var block = this;

    block.subBlockType = choices.subBlockType;

    var sliderConfig = {
        controls: {
            next: 'Next',
            prev: 'Prev'
        },
        itemsPerSlide: 2,
        increment: 2
    };

    imageFilterHelper.fetch({
        apiUrl: block.globalConfig.apiUrl,
        application: block.globalConfig.application,
        accessToken: block.globalConfig.accessToken
    })
    .then(function(filterData) {

        var filterConfig = {
            url: block.globalConfig.apiUrl + '/edt/' + block.type,
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
            subType: block.subBlockType
        };

        block.subBlockSearch = new SubBlockSearch({
            application: block.globalConfig.application,
            accessToken: block.globalConfig.accessToken,
            apiUrl: block.globalConfig.apiUrl,
            $container: block.$editor,
            filterConfig: filterConfig,
            sliderConfig: sliderConfig,
            subBlockType: block.subBlockType
        });

        block.$editor.show();

        block.subBlockSearch.on('ready', function() {
            block.$inner.prepend(block.$inputs);
        });

        block.subBlockSearch.on('selected', function(selectedSubBlock) {
            block.setData({
                id: selectedSubBlock.id,
                type: selectedSubBlock.type
            });

            block.subBlockSearch.destroy();

            block.$editor.append(selectedSubBlock.renderLarge());

            block.$inputs.hide();
            block.$editor.show();
        });
    })
    .catch(function(err) {
        console.error(err);
    });
}

module.exports = Block.extend({
    type: 'media',

    title: i18n.t('blocks:medias:title'),

    chooseable: true,
    droppable: true,
    uploadable: true,

    icon_name: 'image',

    editorHTML: '<div class="st-medias-block"></div>',

    loadData: function(data) {
        if (!_.isEmpty(data)) {
            this.loading();

            var retrieveUrl = this.globalConfig.apiUrl + '/edt/' + this.type + '/' + data.id;

            xhr.get(retrieveUrl, {
                data: {
                    access_token: this.globalConfig.accessToken
                }
            })
            .then(function(rawSubBlockData) {
                var subBlockData = Object.assign({}, rawSubBlockData.content, data);

                var mediaSubBlock = subBlockManager.buildSingle({
                    accessToken: this.globalConfig.accessToken,
                    apiUrl: this.globalConfig.apiUrl,
                    application: this.globalConfig.application,
                    content: subBlockData,
                    parentID: this.blockID,
                    type: data.type
                });

                this.$editor.append(mediaSubBlock.renderLarge());

                this.ready();
            }.bind(this))
            .catch(function(err) {
                throw new Error('No block returned for id:' + this.subBlockData.id + ' on app:' + this.subBlockData.application + ' ' + err);
            }.bind(this));
        }
    },

    onBlockRender: function() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.$inputs.detach();

            this.$inputs.find('input').on('change', function(e) {
                this.onDrop(e.currentTarget);
            }.bind(this));

            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
    },

    onDrop: function(transferData) {
        var self = this;

        var file = transferData.files[0];
        var urlAPI = (typeof window.URL !== 'undefined') ? window.URL : (typeof window.webkitURL !== 'undefined') ? window.webkitURL : null;

        if (/image|video/.test(file.type)) {
            self.loading();

            self.$dropzone.html($('<img>', {
                'class': 'placeholder-image',
                src: urlAPI.createObjectURL(file)
            }));

            self.$uploader.hide();

            self.subBlockSearch.destroy();
            self.subBlockSearch = null;

            self.uploader.upload(file)
                .then(function(uploadData) {
                    var retrieveUrl = self.globalConfig.apiUrl + '/edt/' + self.type + '/' + uploadData.idMedia;

                    self.setData({
                        id: uploadData.idMedia
                    });

                    return xhr.get(retrieveUrl, {
                        data: {
                            access_token: self.globalConfig.accessToken
                        }
                    })
                    .then(function(subBlockData) {
                        self.$inputs.hide();

                        subBlockData.content.copyrights = self.copyrights;
                        subBlockData.content.categories = self.categories;

                        var mediaSubBlock = subBlockManager.buildSingle({
                            accessToken: self.globalConfig.accessToken,
                            apiUrl: self.globalConfig.apiUrl,
                            application: self.globalConfig.application,
                            content: subBlockData.content,
                            parentId: self.blockID,
                            type: data.type
                        });

                        self.$editor.empty();

                        self.$editor.append(mediaSubBlock.renderLarge());

                        self.$editor.show();

                        self.ready();
                    })
                    .catch(function(err) {
                        throw new Error('No block returned for id:' + uploadData.idMedia + ' ' + err);
                    });
                })
                .catch(function(error) {
                    console.error(error);
                    self.addMessage(i18n.t('blocks:image:upload_error'));
                    self.ready();
                });
        }
    }
});
