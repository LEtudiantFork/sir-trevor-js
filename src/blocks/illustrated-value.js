/*
    Illustrated Block
*/

import Block from '../block';
import IconPicker from '../helpers/iconpicker.class';

import ScribeTextBlockPlugin from './scribe-plugins/scribe-text-block-plugin';
import ScribePastePlugin from './scribe-plugins/scribe-paste-plugin';

const editorHTML = `
    <div class="st-block--illustated">
        <div class="st-block--illustated__icon">
            <svg class="c-icon-svg">
                <use xmlns:xlink="http://www.w3.org/1999/xlink"></use>
            </svg>
        </div>
        <div class="st-block--illustated__content">
            <input type="text" class="st-block--illustated__title" name="title" />
            <input type="color" class="st-block--illustated__colorpicker" name="color" />
            <div class="st-text-block st-block--illustated__text" contenteditable="true"></div>
        </div>
    </div>
`;

export default Block.extend({

    type: 'illustratedvalue',

    title: () => i18n.t('blocks:illustratedValue:title'),

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
        tags: { p: true }
    },

    loadData({ title = 'Titre', color = '#000000', text = 'Contenu du paragraphe', iconSlug = 'bulle-info' }) {
        this.$svg = this.$('svg')[0];
        this.$svgUse = this.$('use')[0];
        this.$title = this.$('input[name="title"]')[0];
        this.$color = this.$('input[name="color"]')[0];

        this.setTextBlockHTML(text);

        this.setIcon(iconSlug);

        this.$title.value = title;
        this.$color.value = color;
    },

    onBlockRender() {
        if (this.isEmpty()) {
            this.focus();
        }

        this.setColor();

        this.iconPicker = IconPicker.create(this.globalConfig.illustratedIcons);
        this.iconPicker.on('selected', icon => this.setIcon(icon));

        this.$color.addEventListener('input', () => this.setColor());
        this.$svg.addEventListener('click', () => this.iconPicker.open());

        this.mediator.on('block:remove', blockID => {
            if (this.blockID === blockID) {
                this.iconPicker.destroy();
                this.iconPicker = null;
            }
        });
    },

    setColor() {
        this.$title.style.color = this.$color.value;
        this.$svg.style.fill = this.$color.value;
    },

    setIcon(iconSlug) {
        this.setData({ iconSlug: iconSlug });
        this.$svgUse.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#icon-${iconSlug}`);

        if (this.iconPicker) {
            this.iconPicker.close();
        }
    },

    isEmpty() {
        return !this.getBlockData().text;
    }
});
