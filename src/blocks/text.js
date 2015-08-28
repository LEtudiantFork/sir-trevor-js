'use strict';

/*
    Text Block
*/

var $               = require('etudiant-mod-dom');
var Block           = require('../block');
var i18n            = require('../i18n-stub.js');
var ImageInserter   = require('../helpers/image-inserter.class.js');

var framedConfig = {
    blue: {
        label: 'bleu',
        value: 'blue'
    },
    red: {
        label: 'rouge',
        value: 'red'
    },
    green: {
        label: 'vert',
        value: 'green'
    }
};

module.exports = Block.extend({

    type: 'text',

    scribeOptions: { allowBlockElements: true,
    tags: {
        p: true,
        table: true,
        td: true,
        tbody: true,
        tr: true,
        figure: true,
        figcaption: true,
        img: true
    }
    },

    controllable: true,

    controls: [
        {
            slug: 'show-picture',
            sleep: true,
            eventTrigger: 'click',
            fn: function() {

                this.imageInserter.openSearch();

                this.imageInserter.once('selected', (selectedImage) => {
                    this.editor.style.cursor = 'copy';

                    $(this.editor).once('click', () => {
                        this.editor.style.cursor = '';

                        this._dynamicImages = this._dynamicImages || {};
                        this.blockStorage.data.dynamicImages = this.blockStorage.data.dynamicImages || {};

                        this._dynamicImages[selectedImage.id] = selectedImage;

                        this.blockStorage.data.dynamicImages[selectedImage.id] = selectedImage.getSaveData();

                        this._scribe.commands.insertFigure.execute(selectedImage.renderInBlock());
                    });
                });
            },
            html: '<button type="button">Insérir une image</button>'
        },
        {
            slug: 'framed',
            eventTrigger: 'change',
            fn: function(e) {
                e.preventDefault();

                var result = e.target.value;

                $(this.editor).removeClassByPrefix('st-framed');

                if (result !== 'false') {
                    this.editor.classList.add('st-framed-' + result);
                }

                this.setData({
                    framed: result
                });
            },
            html:
                `<select>
                    <option selected disabled value"">${ i18n.t('framed:choose') }</option>
                    <option value="false">${ i18n.t('framed:no_style') }</option>
                    <option value="${ framedConfig.blue.value }">${ framedConfig.blue.label }</option>
                    <option value="${ framedConfig.red.value }">${ framedConfig.red.label }</option>
                    <option value="${ framedConfig.green.value }">${ framedConfig.green.label }</option>
                </select>`
        },
        {
            slug: 'add-table',
            eventTrigger: 'click',
            fn: function() {
                if (document.activeElement !== this.editor) {
                    this._scribe.el.focus();
                }

                this._scribe.commands.table.execute();
            },
            html: '<button type="button">Insérir un tableau</button>'
        }
    ],

    title: function() { return i18n.t('blocks:text:title'); },

    editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',

    icon_name: 'text',

    loadData: function(data) {
        window.textBlock = this;

        this.setTextBlockHTML(data.text);

        if (data.framed) {
            this.editor.classList.add('st-framed-' + data.framed);
        }

        ImageInserter.init({
            accessToken: this.globalConfig.accessToken,
            apiUrl: this.globalConfig.apiUrl,
            application: this.globalConfig.application,
            block: this
        }).then((imageInserter) => {
            this.imageInserter = imageInserter;

            this.imageInserter.on('replace', (dynamicImage) => {
                dynamicImage.replaceRenderedInBlock(this.editor);

                this.blockStorage.data.dynamicImages[dynamicImage.id] = dynamicImage.getSaveData();
            });

            this._scribe.eventBus.on('editFigure', (figure) => {
                var shouldReplace = true;
                var id = figure.dataset.subBlockId.trim();
                var dynamicImage = this._dynamicImages[id];

                this.imageInserter.editImage(dynamicImage, shouldReplace);
            });

            this._scribe.eventBus.on('deleteFigure', (figure) => {
                figure.remove();

                var id = figure.dataset.subBlockId.trim();

                delete this._dynamicImages[id];
                delete this.blockStorage.data.dynamicImages[id];
            });

            if (data.dynamicImages) {
                ImageInserter.reinitialiseImages({
                    accessToken: this.globalConfig.accessToken,
                    apiUrl: this.globalConfig.apiUrl,
                    application: this.globalConfig.application,
                    parentID: this.blockID,
                    storedImages: data.dynamicImages
                })
                .then((dynamicImages) => {
                    this._dynamicImages = this._dynamicImages || {};

                    dynamicImages.forEach((dynamicImage) => {
                        this._dynamicImages[dynamicImage.id] = dynamicImage;
                    });
                });
            }
        });
    }
});
