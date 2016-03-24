'use strict';

/*
    Heading Block
*/

const Block    = require('../block');
const stToHTML = require('../to-html');

const scribeBuild           = require('../scribe.build.js');
const ScribeTextBlockPlugin = require('./scribe-plugins/scribe-text-block-plugin');

module.exports = Block.extend({

    type: 'heading',

    title: function(){ return i18n.t('blocks:heading:title'); },

    editorHTML: '<div class="st-required st-text-block st-block--heading" contenteditable="true"></div>',

    configureScribe: function(scribe) {
        scribe.use(new ScribeTextBlockPlugin(this));

        // add H1, H2 and H3 support
        scribe.use(scribeBuild.scribePluginHeadingCommand(1));
        scribe.use(scribeBuild.scribePluginHeadingCommand(2));
        scribe.use(scribeBuild.scribePluginHeadingCommand(3));

        scribe.on('content-changed', this.toggleEmptyClass.bind(this));
    },

    controllable: true,
    textable: false,
    toolbarEnabled: true,
    formatBarEnabled: false,

    controls: {
        heading1(e) {
            e.preventDefault();
            this._scribe.el.focus();
            this._scribe.commands.h1.execute();
        },
        heading2(e) {
            e.preventDefault();
            this._scribe.el.focus();
            this._scribe.commands.h2.execute();
        },
        heading3(e) {
            e.preventDefault();
            this._scribe.el.focus();
            this._scribe.commands.h3.execute();
        },
        extra: {
            event: 'change',
            html: '<select><option value="yep">yep</option><option value="nope">nope</option></select>',
            cb() {
                alert('This should be set off by the select');
            }
        }
    },

    scribeOptions: {
        allowBlockElements: false,
        tags: {
            p: false
        }
    },

    icon_name: 'Header',

    loadData: function(data){
        if (this.options.convertFromMarkdown && data.format !== 'html') {
            this.setTextBlockHTML(stToHTML(data.text, this.type));
        }
        else {
            this.setTextBlockHTML(data.text);
        }
    },

    onBlockRender: function() {
        this.focus();
        this.toggleEmptyClass();
    },

    toggleEmptyClass: function() {
        this.el.classList.toggle('st-block--empty', this._scribe.getTextContent().length === 0);
    }
});
