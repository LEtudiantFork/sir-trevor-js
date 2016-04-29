/*
    Illustrated Block
*/

import Block from '../block';
import IconPicker from '../helpers/iconpicker.class';

const editorHTML = `
    <div class="st-block--illustated">
        <img class="st-block-img st-utils__v-middle" src="" width="100" height="100" />
        <input type="text" name="title" />
        <input type="color" name="color" />
        <div class="st-required st-text-block" contenteditable="true"></div>
    </div>
`;

export default Block.extend({

    type: 'illustrated',

    title: () => i18n.t('blocks:illustrated:title'),

    editorHTML,

    icon_name: 'illustrated-value',

    toolbarEnabled: true,

    loadData({ title = '', color = '', text = '', image = '' }){
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
    }
});
