'use strict';

/*
    Text Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

var ScribeTextBlockPlugin = require('./scribe-plugins/scribe-text-block-plugin');
var ScribePastePlugin = require('./scribe-plugins/scribe-paste-plugin');
var ScribeQuotePlugin = require('./scribe-plugins/scribe-quote-plugin');

module.exports = Block.extend({

    type: 'text',

    title() { return i18n.t('blocks:text:title'); },

    editorHTML: '<div class="st-text-block" contenteditable="true"></div>',

    icon_name: 'text',

    textable: true,

    toolbarEnabled: false,

    configureScribe(scribe) {
        scribe.use(new ScribeTextBlockPlugin(this));
        scribe.use(new ScribePastePlugin(this));
        scribe.use(new ScribeQuotePlugin(this));

        scribe.on('content-changed', this.toggleEmptyClass.bind(this));
    },

    scribeOptions: {
        allowBlockElements: true,
        tags: {
            p: true
        }
    },

    loadData(data) {
        if (this.options.convertFromMarkdown && data.format !== 'html') {
            this.setTextBlockHTML(stToHTML(data.text, this.type));
        }
        else {
            this.setTextBlockHTML(data.text);
        }
    },

    onBlockRender() {
        this.toggleEmptyClass();
    },

    toggleEmptyClass() {
        this.el.classList.toggle('st-block--empty', this.isEmpty());
    },

    isEmpty() {
        return this._scribe.getTextContent() === '';
    }
});
