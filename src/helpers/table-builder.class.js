var _           = require('../lodash');
var $           = require('jquery');
var eventablejs = require('eventablejs');

var tableTpl            = '<table><%= tableMarkup %></table>';
var headerTpl           = '<thead><%= tableHeaderMarkup %></thead>';
var rowTpl              = '<tr><%= tableRowMarkup %></tr>';
var columnHeaderCellTpl = '<th><input type="text" value="<%= cellContent %>" data-old-value="<%= cellContent %>" data-cell-type="column-header" /></th>';
var rowHeaderCellTpl    = '<td><input type="text" value="<%= cellContent %>" data-old-value="<%= cellContent %>" data-cell-type="row-header" /></th>';
var cellTpl             = '<td><input type="text" value="<%= cellContent %>" data-cell-type="standard" data-coord="<%= cellCoord %>" /></td>';

function getValueInRawData(params) {
    var result = params.rawData.filter(function(rawDataItem) {
        return rawDataItem[params.rowKey] === params.rowProp && rawDataItem[params.columnKey] === params.columnProp;
    })[0];

    return result[params.valueKey];
}

function prepareData(params) {
    var prepared;

    var rowNames = _.uniq(params.tableData.map(function(tableDataItem) {
        return tableDataItem[params.rowKey];
    }));

    var columnNames = _.uniq(params.tableData.map(function(tableDataItem) {
        return tableDataItem[params.columnKey];
    }));

    prepared = rowNames.map(function(rowName) {
        var preparedRow = [];

        preparedRow.push(rowName);

        columnNames.forEach(function(columnName) {
            preparedRow.push({
                coord: rowName + '$' + columnName,
                value: getValueInRawData({
                    rawData: params.tableData,
                    rowKey: params.rowKey,
                    rowProp: rowName,
                    columnKey: params.columnKey,
                    columnProp: columnName,
                    valueKey: params.valueKey
                })
            });
        });

        return preparedRow;
    });

    prepared.unshift(columnNames);

    return prepared;
}

function createTableCell(cellData) {
    return _.template(cellTpl, {
        cellContent: cellData.value,
        cellCoord: cellData.coord
    });
}

function createHeaderCell(cellData) {
    return _.template(columnHeaderCellTpl, {
        cellContent: cellData
    });
}

function createRowHeaderCell(cellData) {
    return _.template(rowHeaderCellTpl, {
        cellContent: cellData
    });
}

function createTableRow(rawRowData, isHeader) {
    var tableRowMarkup = '';

    rawRowData.forEach(function(cellData, index) {
        if (isHeader && index === 0) {
            tableRowMarkup += '<th></th>';
        }
        else if (index > 0 && isHeader) {
            tableRowMarkup += createHeaderCell(cellData);
        }
        else if (index === 0) {
            tableRowMarkup += createRowHeaderCell(cellData);
        }
        else {
            tableRowMarkup += createTableCell(cellData);
        }
    });

    return _.template(rowTpl, {
        tableRowMarkup: tableRowMarkup
    });
}

function createTableHeader(rawHeaderData) {
    var isHeader = true;

    rawHeaderData.unshift('');

    return _.template(headerTpl, {
        tableHeaderMarkup: createTableRow(rawHeaderData, isHeader)
    });
}

function createTable(rawTableData) {
    var tableMarkup = '';

    rawTableData.forEach(function(rawRowData, index) {
        if (index === 0) {
            tableMarkup += createTableHeader(rawRowData);

            tableMarkup += '<tbody>';
        }
        else {
            tableMarkup += createTableRow(rawRowData);
        }
    });

    tableMarkup += '</tbody>';

    return _.template(tableTpl, {
        tableMarkup: tableMarkup
    });
}

var TableBuilder = function(tableType) {
    var type = tableType;
    var self = this;

    this.$elem = $('<div class="st-table"></div>');

    this.$elem.on('keyup', _.debounce(function(e) {
        var $srcElement = $(e.originalEvent.srcElement);

        var cellType = $srcElement.data('cellType');

        if (cellType === 'row-header') {
            self.trigger('change:header:row', {
                value: $srcElement.val(),
                oldValue: $srcElement.data('oldValue')
            });
        }
        else if (cellType === 'column-header') {
            self.trigger('change:header:column', {
                value: $srcElement.val(),
                oldValue: $srcElement.data('oldValue')
            });
        }
        else {
            self.trigger('change:cell', {
                value: $srcElement.val(),
                row: $srcElement.data('coord').split('$')[0],
                column: $srcElement.data('coord').split('$')[1]
            });
        }
    }, 400));
};

TableBuilder.prototype = Object.assign({

    generate: function(data) {
        this.$elem.empty();

        var preparedData = prepareData({
            tableData: data,
            columnKey: 'year',
            rowKey: 'name',
            valueKey: 'value'
        });

        this.$elem.append(createTable(preparedData));
    }

}, eventablejs);

module.exports = TableBuilder;
