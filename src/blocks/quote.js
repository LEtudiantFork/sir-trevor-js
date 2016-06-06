/*
    Block Quote
*/

import Block from '../block';
import stToHTML from '../to-html';

import ScribeQuotePlugin from './scribe-plugins/scribe-quote-plugin';

const editorHTML = `
    <blockquote class="st-required st-text-block st-text-block--quote" contenteditable="true"></blockquote>
    <label class="st-input-label"> ${ i18n.t('blocks:quote:credit_field') }</label>
    <input class="st-input-string" maxlength="140" name="cite" placeholder="${ i18n.t('blocks:quote:credit_field') }" type="text" />
`;

export default Block.extend({

    type: 'quote',

    title: () => i18n.t('blocks:quote:title'),

    editorHTML,

    'icon_name': 'fmt-quote',

    controllable: false,

    textable: false,

    toolbarEnabled: true,

    formatBarEnabled: true,

    configureScribe(scribe) {
        scribe.use(new ScribeQuotePlugin(this));
    },

    loadData({ text, cite = '', format = '' }) {
        this.setTextBlockHTML(format === 'html' ? text : stToHTML(text, this.type));
        this.$('input[name="cite"]')[0].value = cite;
    }
});
