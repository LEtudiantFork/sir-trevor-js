/*
    Script Block
*/

import Block  from '../block';

const editorHTML = `
    <div class="st-block--script">
        <textarea name="script"></textarea>
    </div>
`;

export default Block.extend({

    type: 'script',

    title: () => i18n.t('blocks:script:title'),

    editorHTML,

    'icon_name': 'script',

    toolbarEnabled: false,

    loadData({ script = '' }) {
        this.$('textarea')[0].value = script;
    },

    onBlockRender() {}
});
