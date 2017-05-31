/*
    Poll Block
*/

import Block  from '../block';

const tplBlock = (title, choices, url) => `
    <div class="c-block-poll c-block c-box c-box--wire">
        <div class="c-edito-genre">
            <div class="c-edito-genre__icon">
                <svg class="c-icon-svg c-icon-svg__sondage">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-sondage"></use>
                </svg>
            </div>

            <div class="c-edito-genre__label">Sondage</div>
        </div>

        <div class="c-block-poll__title">${title}</div>

        <div class="c-block-poll__content">
            <form action="" method="post" class="c-form c-block-poll__form">
                ${choices.length === 0 ?
                    '<div class="c-block-poll__no-choice">Aucun choix n\'a été trouvé dans ce sondage.</div>' : ''
                }

                ${choices.map(choice => `
                    <div class="c-form__field__input c-radio-list c-block-poll__row">
                        <label class="c-radio c-radio--standard c-radio--label-after u-themed">
                            <input type="radio" name="question_x" value="1" />

                            <span class="c-radio__label">${choice.label}</span>
                            <div class="c-radio__indicator"></div>
                        </label>
                    </div>`
                ).join('')}
                <div class="c-block-poll__action">
                    <a href="${url}" target="_blank" class="c-button c-button--medium c-button--squared u-themed">Valider</a>
                </div>
            </form>
        </div>
    </div>
`;

export default Block.extend({
    type: 'poll',

    title: () => i18n.t('blocks:poll:title'),

    'icon_name': 'poll',

    toolbarEnabled: false,

    countable: false,

    loadData({ title = '', choices = [], url = '' }) {
        this.inner.innerHTML = tplBlock(title, choices, url);
    }
});
