/*
    Illustrated Block
*/

import Block from '../block';
import IconPicker from '../helpers/iconpicker.class';

import ScribeTextBlockPlugin from './scribe-plugins/scribe-text-block-plugin';
import ScribePastePlugin from './scribe-plugins/scribe-paste-plugin';

const editorHTML = `
    <div class="st-block--illustated">
        <img class="st-block-img left st-utils__v-middle" src="" width="100" height="100" />
        <input type="text" name="title" placeholder="${ i18n.t('blocks:illustratedValue:placeholder') }" />
        <input type="color" name="color" />
        <div class="st-text-block" contenteditable="true"></div>
    </div>
`;

export default Block.extend({

    type: 'illustratedValue',

    title: () => i18n.t('blocks:illustratedValue:title'),

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

    loadData({ title = '', color = '', text = '<p><br/></p>', image = '' }) {
        this.setTextBlockHTML(text);
        this.$('img.st-block-img')[0].src = image;
        this.$('input[name="title"]')[0].value = title;
        this.$('input[name="color"]')[0].value = color;
    },

    onBlockRender() {
        if (this.isEmpty()) {
            this.focus();
        }

        this.setColor();

        this.iconPicker = IconPicker.create();
        this.iconPicker.on('selected', icon => this.setIcon(icon));

        this.$('input[name="color"]')[0].addEventListener('input', () => this.setColor());
        this.$('img.st-block-img')[0].addEventListener('click', () => this.iconPicker.open());
    },

    setColor() {
        this.$('input[name="title"]')[0].style.color = this.$('input[name="color"]')[0].value;
    },

    setIcon(icon) {
        this.$('img.st-block-img')[0].src = icon.src;
        this.setData({ image: icon.src });
        this.iconPicker.close();
    },

    isEmpty() {
        const { text } = this.getBlockData();
        return !text;
    }
});
