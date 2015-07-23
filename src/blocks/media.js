'use strict';

/*
  Media block - images et vidéos
*/

var $   = require('jquery');
var xhr = require('etudiant-mod-xhr');

var _     = require('../lodash.js');
var Block = require('../block');
var utils = require('../utils');

var SubBlockSearch = require('../helpers/sub-block-search.class.js');
var subBlockManager = require('../sub_blocks/sub-block-manager.js');

var chooseableConfig = {
    name: 'subBlockType',
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

function addBlockMessageTemporarily(block, message) {
    block.addMessage(message, 'st-block-displaying-message');

    window.setTimeout(function() {
        block.resetMessages();
    }, 3000);
}

function registerSaveMediaSubBlock(block, mediaSubBlock) {
    mediaSubBlock.on('save', function(saveData) {

        if (mediaSubBlock.isSaving !== true) {
            mediaSubBlock.isSaving = true;

            if (mediaSubBlock.isEditable) {
                var url = block.globalConfig.apiUrl + '/edt/media/' + mediaSubBlock.id + '?access_token=' + block.globalConfig.accessToken;

                xhr.patch(url, saveData)
                    .then(function(returnedData) {
                        block.setData({
                            id: returnedData.content.id,
                            type: mediaSubBlock.type
                        });

                        addBlockMessageTemporarily(block, i18n.t('general:save'));
                        mediaSubBlock.isSaving = false;
                    })
                    .catch(function(err) {
                        console.error('Error updating media information', err);
                    });
            }
            else if (!_.isEmpty(saveData)) {
                block.setData(saveData);

                addBlockMessageTemporarily(block, i18n.t('general:save'));

                mediaSubBlock.isSaving = false;
            }
        }
    });
}

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

    var categoryOptionsUrl = block.globalConfig.apiUrl + '/edt/' + block.type + '/filters/' + block.globalConfig.application;

    var categoryOptionsPromise = xhr.get(categoryOptionsUrl, {
        data: {
            access_token: block.globalConfig.accessToken
        }
    })
    .then(function(result) {
        block.copyrights = prepareCopyrights(result.content.copyrights);
        block.categories = prepareCategories(result.content.categories);

        return block.categories;
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
                placeholder: 'Category',
                options: categoryOptionsPromise
            }
        ],
        limit: 20,
        container: block.$inner,
        application: block.globalConfig.application,
        subType: block.subBlockType
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
        this.$inner.prepend(this.$inputs);
    }.bind(this));

    this.subBlockSearch.on('selected', function(selectedSubBlock) {
        this.setData({
            id: selectedSubBlock.id,
            type: selectedSubBlock.type
        });

        this.subBlockSearch.destroy();
        this.subBlockSearch = null;

        this.$editor.html(selectedSubBlock.renderLarge());

        selectedSubBlock.bindToRenderedHTML();

        registerSaveMediaSubBlock(this, selectedSubBlock);

        this.$inputs.hide();
        this.$editor.show();
    }.bind(this));
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

                var mediaSubBlock = subBlockManager.buildSingle(data.type, subBlockData);

                this.$editor.html(mediaSubBlock.renderLarge());

                mediaSubBlock.bindToRenderedHTML();

                registerSaveMediaSubBlock(this, mediaSubBlock);

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

                    xhr.get(retrieveUrl, {
                        data: {
                            access_token: self.globalConfig.accessToken
                        }
                    })
                    .then(function(subBlockData) {
                        self.$inputs.hide();

                        var mediaSubBlock = subBlockManager.buildSingle(self.subBlockType, subBlockData.content);

                        mediaSubBlock.addData({
                            copyrights: self.copyrights,
                            categories: self.categories
                        });

                        self.$editor.html(mediaSubBlock.renderEditable());

                        mediaSubBlock.bindToRenderedHTML();

                        self.$editor.show();

                        registerSaveMediaSubBlock(self, mediaSubBlock);

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
