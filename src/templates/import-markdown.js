export function template() {
    return `
    <div class="st-import-markdown" style="display: none;">
        <textarea class="st-textarea st-import-markdown--field" placeholder="${ i18n.t('blocks:markdown:placeholder') }"></textarea>
        <button class="st-btn st-import-markdown--btn" type="button">${ i18n.t('blocks:markdown:button') }</button>
    </div>
    `;
}
