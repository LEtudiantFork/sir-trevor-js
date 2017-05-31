/*
    HR
*/

import Block from '../block';

export default Block.extend({

    type: 'hr',

    title: () => i18n.t('blocks:hr:title'),

    editorHTML: '<hr class="st-block-hr" />',

    'icon_name': 'Encarded',

    controllable: false,

    textable: false,

    toolbarEnabled: true,

    formatBarEnabled: false,

    anchorable: false,

    countable: false

});
