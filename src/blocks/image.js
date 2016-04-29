/*
    Image Block
*/

import Block  from '../block';

const editorHTML = `
    <div class="st-block--image">
        <figure>
            <img class="st-block-img" />
        </figure>
        <input type="text" name="legend" />
    </div>
`;

export default Block.extend({

    type: 'image',

    title: () => i18n.t('blocks:image:title'),

    editorHTML,

    'icon_name': 'Image',

    toolbarEnabled: false,

    loadData({ file = '', legend = '' }) {
        this.$('input[name="legend"]')[0].value = legend;
        this.$('img.st-block-img')[0].src = file;
    }
});
