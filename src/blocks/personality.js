/*
    Personality Block
*/

import Block  from '../block';
import config from '../config';

const editorHTML = `
    <div class="st-block--quiz">
        <div class="st-block--quiz__img"></div>
        <div class="st-block--quiz__edito">Test</div>
        <div class="st-block--quiz__title"></div>

        <a class="st-block--quiz__link" href="" target="_blank">Commencer le Test</a>

        <p class="st-block--quiz__desc"></p>
    </div>
`;

export default Block.extend({

    type: 'personality',

    title: () => i18n.t('blocks:personality:title'),

    editorHTML,

    'icon_name': 'personality',

    toolbarEnabled: false,

    loadData({ title = '', image = '', description = '', url = '' }) {
        this.$('.st-block--quiz__title')[0].innerHTML = title;
        this.$('.st-block--quiz__desc')[0].innerHTML = description;
        this.$('.st-block--quiz__link')[0].href = url;
        this.$('.st-block--quiz__img')[0].innerHTML = `<img class="st-block-img st-utils__v-middle" src="${image}" />`;
    }
});
