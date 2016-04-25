import config from '../../config.js';

const assets = {
    iconBin: `<svg role="img" class="st-icon"><use xlink:href="${ config.defaults.iconUrl }#icon-Bin"/></svg>`
};

export function renderBUTTON({ action = '', key = '', content = '' }) {
    return `<button type="button"
        data-action="${action}"
        ${key ? `data-key="${key}"` : ''} >${content}</button>`;
}

export function renderADD({ action, content }) {
    return renderBUTTON({ action: `add-${action}`, content });
}

export function renderDELETE({ action, key }) {
    return renderBUTTON({ action: `delete-${action}`, key, content: assets.iconBin });
}

export function renderINPUT({ value = '', cell = 'number', prop = '', ref = '' }) {
    return `<input type="text"
        value="${value}" data-old-value="${value}"
        data-type="${cell}"
        ${prop ? `data-prop="${prop}"` : ''}
        ${ref ? `data-ref="${ref}"` : ''} />`;
}

export function renderCOLOR({ value = '#222222', ref = '' }) {
    return `<input type="color"
        value="${value}" data-old-value="${value}"
        data-type="color"
        data-ref="${ref}" />`;
}

export function renderTABLE(content) {
    return `<table>${content}</table>`;
}

export function renderTHEAD(content) {
    return `<thead>${content}</thead>`;
}

export function renderTBODY(content) {
    return `<tbody>${content}</tbody>`;
}

export function renderTFOOT(content) {
    return `<tfoot>${content}</tfoot>`;
}

export function renderTR(content) {
    return `<tr>${content}</tr>`;
}

export function renderTH(content, attrs = '') {
    return `<th ${attrs}>${content}</th>`;
}

export function renderTD(content, attrs = '') {
    return `<td ${attrs}>${content}</td>`;
}
