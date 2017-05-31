/*
    Personality Block
*/

import Block  from '../block';

const tplBlock = (title, description, url) => `
    <div class="c-quiz">
        <div class="c-edito-genre">
            <div class="c-edito-genre__icon">
                <svg class="c-icon-svg c-icon-svg__sondage">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-question"></use>
                </svg>
            </div>

            <div class="c-edito-genre__label">Test</div>
        </div>

        <div class="c-quiz__title">${title}</div>
        <div class="c-quiz__actions">
            <a href="${url}" target="_blank" class="c-button c-button--medium c-button--rounded c-button--light-border u-themed u-typo--upper">
                Commencer le test
            </a>
        </div>

        <div class="c-quiz__summary">
            <div class="c-quiz__summary__text">
                <p>${description}</p>
            </div>
        </div>
    </div>
`;

export default Block.extend({
    type: 'personality',

    title: () => i18n.t('blocks:personality:title'),

    'icon_name': 'personality',

    toolbarEnabled: false,

    countable: false,

    loadData({ title = '', description = '', url = '' }) {
        this.inner.innerHTML = tplBlock(title, description, url);
    }
});
