var _ = require('../../lodash.js');

var tableTpl            = '<table><%= tableMarkup %></table>';
var headerTpl           = '<thead><tr><th></th><%= tableHeaderMarkup %><th></th></tr></thead>';
var rowTpl              = '<tr><%= tableRowMarkup %></tr>';
var columnHeaderCellTpl = '<th><input type="text" value="<%= cellContent %>" data-old-value="<%= cellContent %>" data-cell-type="column-header" /></th>';
var rowHeaderCellTpl    = '<td><input type="text" value="<%= cellContent %>" data-old-value="<%= cellContent %>" data-cell-type="row-header" /></td>';
var cellTpl             = '<td><input type="text" value="<%= cellContent %>" data-cell-type="standard" data-coord="<%= cellCoord %>" /></td>';
var deleteCell          = '<td><button data-key="<%= keyName %>" type="button"><%= deleteText %></td>'
var footerTpl           = '<tfoot><tr><td></td><%= tableFooterMarkup %></tr></tfoot>';

function renderTableCell(cellData) {
    return _.template(cellTpl, {
        cellContent: cellData.value,
        cellCoord: cellData.coord
    });
}

function renderHeaderCell(cellData) {
    return _.template(columnHeaderCellTpl, {
        cellContent: cellData
    });
}

function renderRowHeaderCell(cellData) {
    return _.template(rowHeaderCellTpl, {
        cellContent: cellData
    });
}

function renderTableRow(rawRowData) {
    var tableRowMarkup = '';

    rawRowData.forEach(function(cellData, index) {
        if (index === 0) {
            tableRowMarkup += renderRowHeaderCell(cellData);
        }
        else {
            tableRowMarkup += renderTableCell(cellData);
        }
    });

    tableRowMarkup += _.template(deleteCell, {
        keyName: rawRowData[0],
        deleteText: 'supprimer' // @todo i18n
    });

    return _.template(rowTpl, {
        tableRowMarkup: tableRowMarkup
    });
}

function renderTableHeader(rawHeaderData) {
    var tableHeaderMarkup = '';

    rawHeaderData.forEach(function(headerCellDataItem) {
        tableHeaderMarkup += renderHeaderCell(headerCellDataItem);
    });

    return _.template(headerTpl, {
        tableHeaderMarkup: tableHeaderMarkup
    });
}

function renderTableFooter(rawFooterData) {
    var tableFooterMarkup = '';

    rawFooterData.forEach(function(cellData) {
        tableFooterMarkup += _.template(deleteCell, {
            keyName: cellData,
            deleteText: 'supprimer' // @todo i18n
        });
    });

    return _.template(footerTpl, {
        tableFooterMarkup: tableFooterMarkup
    });
}

function renderTable(rawTableData) {
    var tableMarkup = '';

    var headerRow = rawTableData.shift();

    tableMarkup += renderTableHeader(headerRow);

    tableMarkup += '<tbody>';

    rawTableData.forEach(function(rawRowData, index) {
        tableMarkup += renderTableRow(rawRowData);
    });

    tableMarkup += '</tbody>';

    tableMarkup += renderTableFooter(headerRow);

    return _.template(tableTpl, {
        tableMarkup: tableMarkup
    });
}

exports.renderTable = renderTable;
exports.renderTableFooter = renderTableFooter;
