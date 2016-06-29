/*
    Block Quote
*/

import Block from '../block';
import { QUOTE } from '../helpers/import-marker/variables';

import ScribeQuotePlugin from './scribe-plugins/scribe-quote-plugin';

const editorHTML = `
    <blockquote class="st-required st-text-block st-text-block--quote" contenteditable="true">
        Si vis pacem para bellum. Si vis pacem para bellum. Si vis pacem para bellum. Si vis pacem para bellum. Si vis pacem para bellum.
    </blockquote>
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

    loadData({ text }) {
        const parsedText = this.parseFromMk(text);
        this.setTextBlockHTML(parsedText);
    },

    parseFromMk(markdown) {
        return markdown.replace(QUOTE, '');
    }
});
