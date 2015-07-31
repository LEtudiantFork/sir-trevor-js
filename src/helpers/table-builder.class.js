var _           = require('../lodash');
var $           = require('jquery');
var eventablejs = require('eventablejs');

var tableTemplate       = '<table><%= tableContent %></table>';
var tableHeaderTemplate = '<thead><%= tableHeaderContent %></thead>';
var tableRowTemplate    = '<tr><%= tableRowContent %></tr>';
var tableCellTemplate   = '<td><%= tableCellContent %></td>';

function createTableCell(tableCellContent) {
    return _.template(tableCellTemplate, {
        tableCellContent: tableCellContent
    });
}

function createTableRow(rawRowContent) {
    var tableRowContent = '';

    rawRowContent.forEach(function(cellContent) {
        tableRowContent += createTableCell(cellContent);
    });

    return _.template(tableRowTemplate, {
        tableRowContent: tableRowContent
    });
}

function createTable(rawTableContent) {
    var tableContent = '';

    rawTableContent.forEach(function(rawRowContent, index) {
        if (index === 0) {
            tableContent += _.template(tableHeaderTemplate, {
                tableHeaderContent: createTableRow(rawRowContent)
            });

            tableContent += '<tbody>';
        }
        else {
            tableContent += createTableRow(rawRowContent);
        }
    });

    tableContent += '</tbody>';

    return _.template(tableTemplate, {
        tableContent: tableContent
    });
}

var TableBuilder = function() {
    this.$elem = $('<div class="st-table"></div>');
};

TableBuilder.prototype = {
    generateTable: function(tableContent) {
        this.$elem.empty();

        this.$elem.append(createTable(tableContent));
    }
};

module.exports = TableBuilder;
