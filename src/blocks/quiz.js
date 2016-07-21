/*
    Quiz Block
*/

import Block  from '../block';
import config from '../config';

const editorHTML = `
    <div class="st-block--quiz">
        <div class="st-block--quiz__edito">Quiz</div>
        <div class="st-block--quiz__title"></div>

        <a class="st-block--quiz__link" href="" target="_blank">Commencer le Quiz</a>

        <p class="st-block--quiz__desc"></p>
    </div>
`;

export default Block.extend({

    type: 'quiz',

    title: () => i18n.t('blocks:quiz:title'),

    editorHTML,

    'icon_name': 'quiz',

    toolbarEnabled: false,

    loadData({ title = '', description = '', url = '' }) {
        this.$('.st-block--quiz__title')[0].innerHTML = title;
        this.$('.st-block--quiz__desc')[0].innerHTML = description;
        this.$('.st-block--quiz__link')[0].href = url;
    }
});
