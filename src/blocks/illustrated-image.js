/*
    Illustrated Block
*/

import Block from '../block';

import ScribeTextBlockPlugin from './scribe-plugins/scribe-text-block-plugin';
import ScribePastePlugin from './scribe-plugins/scribe-paste-plugin';

const editorHTML = `
    <div class="st-block--illustated">
        <img class="st-block-img st-utils__v-middle" src="" width="100" height="100" />
        <div class="st-text-block" contenteditable="true"></div>
    </div>
`;

export default Block.extend({

    type: 'illustratedLeft',

    title: () => i18n.t('blocks:illustratedLeft:title'),

    editorHTML,

    'icon_name': 'illustrated-value',

    textable: true,

    toolbarEnabled: false,

    configureScribe(scribe) {
        scribe.use(new ScribeTextBlockPlugin(this));
        scribe.use(new ScribePastePlugin(this));
    },

    scribeOptions: {
        allowBlockElements: true,
        tags: {
            p: true
        }
    },

    loadData({ text = '<br/>', image = '', position = 'left' }) {
        this.setTextBlockHTML(text);
        this.$('img.st-block-img')[0].src = image;
        this.$('img.st-block-img')[0].classList.add(position);
    },

    onBlockRender() {
        if (this.isEmpty()) {
            this.focus();
        }

        this.$('img.st-block-img')[0].addEventListener('click', () => console.log('open Mediatheque'));
    },

    isEmpty() {
        const { text } = this.getBlockData();
        return !text;
    }
});
