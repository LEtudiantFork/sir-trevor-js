/*
    Illustrated Block
*/

import Block from '../block';
import IconPicker from '../helpers/mediapicker.class';

import ScribeTextBlockPlugin from './scribe-plugins/scribe-text-block-plugin';
import ScribePastePlugin from './scribe-plugins/scribe-paste-plugin';

const editorHTML = `
    <div class="st-block--illustated">
        <img class="st-block-img st-utils__v-middle" src="" width="100" height="100" />
        <div class="st-text-block" contenteditable="true"></div>
    </div>
`;

export default Block.extend({

    type: 'illustrated_image',

    title: () => i18n.t('blocks:illustratedImage:title'),

    editorHTML,

    'icon_name': 'illustrated-value',

    textable: false,

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

    loadData({ text = '', media: { thumbnail = '' } = {}, position = 'left' }) {
        this.setTextBlockHTML(text);
        this.$('img.st-block-img')[0].src = thumbnail;
        this.$('img.st-block-img')[0].classList.add(position);
    },

    onBlockRender() {
        if (this.isEmpty()) {
            this.focus();
        }

        this.mediaPicker = IconPicker.create({
            apiUrl: this.globalConfig.apiUrl,
            accessToken: this.globalConfig.accessToken,
            application: this.globalConfig.application,
            type: 'image'
        });

        this.mediaPicker.on('selected', media => this.addMedia(media));

        this.$('img.st-block-img')[0].addEventListener('click', () => this.mediaPicker.open());


        this.mediator.on('block:remove', blockID => {
            if (this.blockID === blockID) {
                this.mediaPicker.destroy();
                this.mediaPicker = null;
            }
        });
    },

    addMedia(media) {
        this.setData({ media });
        this.$('img.st-block-img')[0].src = media.thumbnail;
    },

    isEmpty() {
        return !this.getBlockData().text;
    }
});
