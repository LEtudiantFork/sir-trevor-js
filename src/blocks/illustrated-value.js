const _     = require('../lodash');
const Block = require('../block');
const IconPicker = require('../helpers/iconpicker.class.js');

const template = _.template(`
    <img class="st-utils__v-middle" src="" width="100" height="100" />
    <input type="text" name="title" />
    <input type="color" name="color" />
    <div class="st-required st-text-block" contenteditable="true"></div>
`);

module.exports = Block.extend({
    type: 'illustrated',

    textable: true,
    toolbarEnabled: true,

    title() { return i18n.t('blocks:illustrated:title'); },

    icon_name: 'illustrated-value',

    editorHTML() {
        return template(this);
    },

    loadData(data){
        this.setTextBlockHTML(data.text);
        this.$('img')[0].src = data.image;
        this.$('[name="title"]')[0].value = data.title;
        this.$('[name="color"]')[0].value = data.color;
    },

    onBlockRender() {
        this.setColor();
        this.focus();

        this.iconPicker = IconPicker.create();
        this.iconPicker.on('selected', icon => this.setIcon(icon));

        this.$('[name="color"]')[0].addEventListener('input', () => this.setColor());
        this.$('img')[0].addEventListener('click', () => this.iconPicker.open());
    },

    setColor() {
        this.$('[name="title"]')[0].style.color = this.$('[name="color"]')[0].value;
    },

    setIcon(icon) {
        this.$('img')[0].src = icon.src;
        this.setData({ image: icon.src });
        this.iconPicker.close();
    }
});
