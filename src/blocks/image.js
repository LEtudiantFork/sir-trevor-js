import Block  from '../block';

const editorHTML = `
    <div class="st-block--image">
        <figure>
            <img class="st-block-img" />
        </figure>
        <input type="text" name="legend" />
    </div>
`;

module.exports = Block.extend({

    type: 'image',

    toolbarEnabled: false,

    title: () => i18n.t('blocks:image:title'),

    icon_name: 'Image',

    editorHTML,

    loadData({ file = '', legend = '' }) {
        this.$('input[name="legend"]')[0].value = legend;
        this.$('img.st-block-img')[0].src = file;
    }
});
