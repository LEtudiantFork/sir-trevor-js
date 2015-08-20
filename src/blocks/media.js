/*
  Media block - images et vidéos
*/


var _                 = require('../lodash.js');
var Block             = require('../block');
var fieldHelper       = require('../helpers/field.js');
var imageFilterHelper = require('../helpers/image-filter.js');
var utils             = require('../utils');
var SubBlockSearch    = require('../helpers/sub-block-search.class.js');
var subBlockManager   = require('../sub_blocks/manager.js');
var xhr               = require('etudiant-mod-xhr');

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
            title: i18n.t('sub_blocks:media:diaporama:title'),
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
            container: block.editor,
            filterConfig: filterConfig,
            sliderConfig: sliderConfig,
            subBlockType: block.subBlockType
        });

        // @todo put this in a class
        // @todo too - is this even necessary any more ?
        block.editor.style.display = 'block';

        block.subBlockSearch.on('selected', function(selectedSubBlock) {
            block.setData({
                id: selectedSubBlock.id,
                type: selectedSubBlock.type
            });

            block.subBlockSearch.destroy();

            block.editor.appendChild(selectedSubBlock.renderLarge()[0]);

            selectedSubBlock.on('save', function(newData) { block.setData(newData); });

            block.editor.style.display = 'block';
        });
    })
    .catch(function(err) {
        console.error(err);
    });
}

module.exports = Block.extend({
    type: 'media',

    title: function() {
        return i18n.t('blocks:media:title');
    },

    chooseable: true,

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

                mediaSubBlock.on('save', function(newData) { this.setData(newData); }.bind(this));

                this.editor.appendChild(mediaSubBlock.renderLarge()[0]);

                this.ready();
            }.bind(this))
            .catch(function(err) {
                throw new Error('No block returned for id:' + this.subBlockData.id + ' on app:' + this.subBlockData.application + ' ' + err);
            }.bind(this));
        }
    },

    onBlockRender: function() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
    }
});
