'use strict';

/*
    Block Quote
*/

var _ = require('../lodash');

var Block = require('../block');
var stToHTML = require('../to-html');
var ScribeQuotePlugin = require('./scribe-plugins/scribe-quote-plugin');

var editorHTML = `
    <blockquote class="st-required st-text-block st-text-block--quote" contenteditable="true"></blockquote>
    <label class="st-input-label"> ${ i18n.t("blocks:quote:credit_field") }</label>
    <input class="st-input-string" maxlength="140" name="cite" placeholder="${ i18n.t("blocks:quote:credit_field") }" type="text" />
`;

module.exports = Block.extend({

    type: 'quote',

    title: function() { return i18n.t('blocks:quote:title'); },

    icon_name: 'fmt-quote',

    textable: true,
    toolbarEnabled: true,

    editorHTML,

    configureScribe: function(scribe) {
        scribe.use(new ScribeQuotePlugin(this));
    },

    loadData: function(data){
        if (this.options.convertFromMarkdown && data.format !== 'html') {
            this.setTextBlockHTML(stToHTML(data.text, this.type));
        }
        else {
            this.setTextBlockHTML(data.text);
        }

        if (data.cite) {
            this.$('input[name="cite"]')[0].value = data.cite;
        }
    }
});
