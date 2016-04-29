/*
    Script Block
*/

// const Dom   = require('../packages/dom');
import Block from '../block';

export default Block.extend({

    type: 'script',

    title: () => i18n.t('blocks:script:title'),

    'icon_name': 'script',

    toolbarEnabled: false,

    loadData(data) {
        console.log(data);
    },

    onBlockRender() {}
});
