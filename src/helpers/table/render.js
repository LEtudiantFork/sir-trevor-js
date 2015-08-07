var _ = require('../../lodash.js');

var templates = {
    table: '<table><%= content %></table>',
    thead: '<thead><%= content %></thead>',
    tbody: '<tbody><%= content %></tbody>',
    tfoot: '<tfoot><%= content %></tfoot>',
    tr: '<tr><%= content %></tr>',
    th: '<th><%= content %></th>',
    td: '<td><%= content %></td>',
    delete: '<button class="st-icon" data-icon="bin" data-type="<%= type %>" data-key="<%= key %>" type="button"></button>',
    inner: '<input type="text" value="<%= value %>" data-old-value="<%= value %>" data-cell-type="<%= type %>" data-coord="<%= coord %>" />'
};

function renderDelete(params) {
    return _.template(templates.delete, {
        key: params.key,
        text: params.text,
        type: params.type
    });
}

function renderInner(params) {
    return _.template(templates.inner, {
        value: params.value,
        type: params.type,
        coord: params.coord || ''
    });
}

function renderElement(params) {
    return _.template(templates[params.type], { content: params.content });
}

function renderTHEAD(content) {
    return renderElement({
        type: 'thead',
        content: content
    });
}

function renderTBODY(content) {
    return renderElement({
        type: 'tbody',
        content: content
    });
}

function renderTFOOT(content) {
    return renderElement({
        type: 'tfoot',
        content: content
    });
}

function renderTH(content) {
    return renderElement({
        type: 'th',
        content: content
    });
}

function renderTR(content) {
    return renderElement({
        type: 'tr',
        content: content
    });
}

function renderTD(content) {
    return renderElement({
        type: 'td',
        content: content
    })
}

function render1DTable(tableData) {
    var headerData = tableData.shift();

    var table = renderTHEAD(renderTR(renderTH('') + renderTH(renderInner({ value: headerData[0], type: 'column-header' })) +  renderTH('')));

    var rows = tableData.map(function(rowData, rowIndex) {
        return renderTR(
            rowData.reduce(function(rowHeader, rowItem, innerIndex) {
                var markup = renderTD(renderInner({ value: rowHeader, type: 'row-header' }));

                markup += renderTD(renderInner({ value: rowItem.value, type: 'standard', coord: rowItem.coord }));

                if (rowIndex === 0) {
                    markup += renderTD('');
                }
                else {
                    markup += renderTD(renderDelete({ key: rowHeader, text: 'supprimer', type: 'row' }));
                }

                return markup;
            })
        );
    });

    table += renderTBODY(rows.reduce(function(previousRow, currentRow) {
        return previousRow += currentRow;
    }.bind(this)));

    return renderElement({
        type: 'table',
        content: table
    });
}

function render2DTable(tableData) {
    var headerData = tableData.shift();

    var table;

    if (headerData.length === 1) {
        table = renderTHEAD(renderTR(renderTH('') + renderTH(renderInner({ value: headerData[0], type: 'column-header' })) +  renderTH('')));
    }
    else {
        table = renderTHEAD(renderTR(
            headerData.reduce(function(previousItem, currentItem, index) {
                if (index === 1) {
                    previousItem = renderTH('') + renderTH(renderInner({ value: previousItem, type: 'column-header' }));
                }

                var markup = previousItem + renderTH(renderInner({ value: currentItem, type: 'column-header' }));

                if (index === headerData.length - 1) {
                    markup += renderTH('');
                }

                return markup;
            })
        ));
    }

    var rows = tableData.map(function(rowData, rowIndex) {
        return renderTR(
            rowData.reduce(function(previousItem, currentItem, innerIndex) {
                if (innerIndex === 1) {
                    previousItem = renderTD(renderInner({ value: previousItem, type: 'row-header' }));
                }

                var markup = previousItem += renderTD(renderInner({ value: currentItem.value, type: 'standard', coord: currentItem.coord }));

                if (rowIndex === 0 && innerIndex === rowData.length - 1) {
                    markup += renderTD('');
                }
                else if (innerIndex === rowData.length - 1) {
                    markup += renderTD(renderDelete({ key: rowData[0], text: 'supprimer', type: 'row' }));
                }

                return markup;
            })
        );
    });

    if (headerData.length > 1) {
        rows.push(
            renderTFOOT(renderTR(
                headerData.reduce(function(previousItem, currentItem, index) {
                    if (index === 1) {
                        previousItem = renderTD('') + renderTD('');
                    }

                    var markup = previousItem + renderTD(renderDelete({ key: currentItem, text: 'supprimer', type: 'column' }));

                    if (index === headerData.length - 1) {
                        markup += renderTD('');
                    }

                    return markup;
                })
            ))
        );
    }

    table += renderTBODY(rows.reduce(function(previousRow, currentRow) {
        return previousRow += currentRow;
    }.bind(this)));

    return renderElement({
        type: 'table',
        content: table
    });
}

exports.render1DTable = render1DTable;
exports.render2DTable = render2DTable;
