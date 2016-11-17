/*
    Illustrated Block
*/
import xhr from 'etudiant-mod-xhr';

import Block from '../block';
import MediaPicker from '../helpers/mediapicker.class';

import ScribeTextBlockPlugin from './scribe-plugins/scribe-text-block-plugin';
import ScribePastePlugin from './scribe-plugins/scribe-paste-plugin';

const API_URL = '/edt/media/';

const editorHTML = `
    <div class="st-block--illustated-image">
        <img class="st-block-img st-utils__v-middle" src="" />
        <div class="st-text-block" contenteditable="true"></div>
    </div>
`;

export default Block.extend({

    type: 'illustratedimage',

    title: () => i18n.t('blocks:illustratedImage:title'),

    editorHTML,

    'icon_name': 'illustrated-value',

    controllable: false,

    textable: false,

    toolbarEnabled: false,

    formatBarEnabled: true,

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

    loadData({ text = '', media = { thumbnail: 'https://placeholdit.imgix.net/~text?txtsize=25&txt=Image&w=200&h=150' }, position = 'left' }) {
        this.setTextBlockHTML(text);
        this.$('img.st-block-img')[0].classList.add(position);

        this.setImage(media);
    },

    onBlockRender() {
        if (this.isEmpty()) {
            this.focus();
        }

        this.mediaPicker = MediaPicker.create({
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

    addMedia({ id }) {
        xhr.get(`${ this.globalConfig.apiUrl }${ API_URL }${ id }`, {
            data: { 'access_token': this.globalConfig.accessToken }
        })
        .then(({ content: media }) => {
            this.setData({ media });
            this.setImage(media);
        });
    },

    setImage({ formats = [], thumbnail }) {
        this.$('img.st-block-img')[0].src = formats[this.globalConfig.formatImage] || thumbnail;
    },

    isEmpty() {
        return !this.getBlockData().text;
    }
});
