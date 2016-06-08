/*
    Text Block
*/

import Block from '../block';

import ScribeTextBlockPlugin from './scribe-plugins/scribe-text-block-plugin';
import ScribePastePlugin from './scribe-plugins/scribe-paste-plugin';
import ScribeQuotePlugin from './scribe-plugins/scribe-quote-plugin';

export default Block.extend({

    type: 'text',

    title: () => i18n.t('blocks:text:title'),

    editorHTML: '<div class="st-text-block" contenteditable="true"></div>',

    'icon_name': 'text',

    controllable: false,

    textable: true,

    toolbarEnabled: false,

    formatBarEnabled: true,

    configureScribe(scribe) {
        scribe.use(new ScribeTextBlockPlugin(this));
        scribe.use(new ScribePastePlugin(this));
        scribe.use(new ScribeQuotePlugin(this));

        scribe.on('content-changed', () => this.toggleEmptyClass());
    },

    scribeOptions: {
        allowBlockElements: true,
        tags: {
            p: true
        }
    },

    loadData({ text = '' }) {
        this.setTextBlockHTML(text);
    },

    onBlockRender() {
        if (this.isEmpty()) {
            this.focus();
        }

        this.toggleEmptyClass();
    },

    toggleEmptyClass() {
        this.el.classList.toggle('st-block--empty', this.isEmpty());
    },

    isEmpty() {
        return this._scribe.getTextContent() === '';
    }
});
