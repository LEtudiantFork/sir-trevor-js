const _ = require('../../lodash.js');

const templates = {
    table: '<table><%= content %></table>',
    thead: '<thead><%= content %></thead>',
    tbody: '<tbody><%= content %></tbody>',
    tfoot: '<tfoot><%= content %></tfoot>',
    tr: '<tr><%= content %></tr>',
    th: '<th><%= content %></th>',
    td: '<td><%= content %></td>',
    delete: '<button data-action="delete-<%= type %>" data-key="<%= key %>" type="button"><svg class="st-icon" style="width: 25px; height: 25px;"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="inc/icons.svg#icon-Bin"></use></svg></button>',
    input: '<input type="text" value="<%= value %>" data-old-value="<%= value %>" data-cell-type="<%= type %>" data-coord="<%= coord %>" />'
};

function renderElement({ type, content }) {
    return _.template(templates[type])({ content });
}

export function renderDELETE({ key, text, type }) {
    return _.template(templates.delete)({ key, text, type });
}

export function renderINPUT({ value, type, coord = '' }) {
    return _.template(templates.input)({ value, type, coord });
}

export function renderTABLE(content) {
    return renderElement({
        type: 'table',
        content
    });
}

export function renderTHEAD(content) {
    return renderElement({
        type: 'thead',
        content
    });
}

export function renderTBODY(content) {
    return renderElement({
        type: 'tbody',
        content
    });
}

export function renderTFOOT(content) {
    return renderElement({
        type: 'tfoot',
        content
    });
}

export function renderTH(content) {
    return renderElement({
        type: 'th',
        content
    });
}

export function renderTR(content) {
    return renderElement({
        type: 'tr',
        content
    });
}

export function renderTD(content) {
    return renderElement({
        type: 'td',
        content
    });
}
