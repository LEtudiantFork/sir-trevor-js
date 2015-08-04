var _           = require('../lodash');
var $           = require('jquery');
var eventablejs = require('eventablejs');

var tableTpl            = '<table><%= tableMarkup %></table>';
var headerTpl           = '<thead><%= tableHeaderMarkup %></thead>';
var rowTpl              = '<tr><%= tableRowMarkup %></tr>';
var columnHeaderCellTpl = '<th><input type="text" value="<%= cellContent %>" data-old-value="<%= cellContent %>" data-cell-type="column-header" /></th>';
var rowHeaderCellTpl    = '<td><input type="text" value="<%= cellContent %>" data-old-value="<%= cellContent %>" data-cell-type="row-header" /></th>';
var cellTpl             = '<td><input type="text" value="<%= cellContent %>" data-cell-type="standard" data-coord="<%= cellCoord %>" /></td>';

function getValueInTwoDimensionalTable(params) {
    var result = params.rawData.filter(function(rawDataItem) {
        return rawDataItem[params.rowKey] === params.rowProp && rawDataItem[params.columnKey] === params.columnProp;
    })[0];

    return result[params.valueKey];
}

function prepareOneDimensionalData(params) {
    var prepared = params.rowNames.map(function(rowName, index) {
        return [
            rowName,
            {
                coord: rowName,
                value: params.tableData[index][params.valueKey]
            }
        ];
    });

    prepared.unshift(params.columnNames);

    return prepared;
}

function prepareTwoDimensionalData(params) {
    var prepared = params.rowNames.map(function(rowName) {
        var preparedRow = [];

        preparedRow.push(rowName);

        params.columnNames.forEach(function(columnName) {
            preparedRow.push({
                coord: rowName + '$' + columnName,
                value: getValueInTwoDimensionalTable({
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

    prepared.unshift(params.columnNames);

    return prepared;
}

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

function renderTableRow(rawRowData, isHeader) {
    var tableRowMarkup = '';

    rawRowData.forEach(function(cellData, index) {
        if (isHeader && index === 0) {
            tableRowMarkup += '<th></th>';
        }
        else if (index > 0 && isHeader) {
            tableRowMarkup += renderHeaderCell(cellData);
        }
        else if (index === 0) {
            tableRowMarkup += renderRowHeaderCell(cellData);
        }
        else {
            tableRowMarkup += renderTableCell(cellData);
        }
    });

    return _.template(rowTpl, {
        tableRowMarkup: tableRowMarkup
    });
}

function renderTableHeader(rawHeaderData) {
    var isHeader = true;

    rawHeaderData.unshift('');

    return _.template(headerTpl, {
        tableHeaderMarkup: renderTableRow(rawHeaderData, isHeader)
    });
}

function renderTable(rawTableData) {
    var tableMarkup = '';

    rawTableData.forEach(function(rawRowData, index) {
        if (index === 0) {
            tableMarkup += renderTableHeader(rawRowData);

            tableMarkup += '<tbody>';
        }
        else {
            tableMarkup += renderTableRow(rawRowData);
        }
    });

    tableMarkup += '</tbody>';

    return _.template(tableTpl, {
        tableMarkup: tableMarkup
    });
}

function registerKeyUpListener(table) {
    table.$elem.on('keyup', _.debounce(function(e) {
        var $srcElement = $(e.originalEvent.srcElement);

        var cellType = $srcElement.data('cellType');

        if (cellType === 'row-header') {
            table.trigger('change:header:row', {
                value: $srcElement.val(),
                oldValue: $srcElement.data('oldValue')
            });
        }
        else if (cellType === 'column-header') {
            table.trigger('change:header:column', {
                value: $srcElement.val(),
                oldValue: $srcElement.data('oldValue')
            });
        }
        else {
            table.trigger('change:cell', {
                value: $srcElement.val(),
                row: $srcElement.data('coord').split('$')[0],
                column: $srcElement.data('coord').split('$')[1]
            });
        }
    }, 400));
}

var tablePrototype = {
    update: function(newData) {
        // var newDataKeys = Object.keys(newData);

        Object.assign(this, newData);

        this.trigger('update');

        // if (newDataKeys.) {
        // }
    },

    generate: function() {
        var self = this;
        var preparedData;
        var columnNames;

        var rowNames = _.uniq(
            this.tableData.map(function(tableDataItem) {
                return tableDataItem[self.rowKey];
            })
        );

        this.$elem.empty();

        if (this.tableType === '1D') {
            columnNames = [this.columnKey];

            preparedData = prepareOneDimensionalData({
                tableData: this.tableData,
                columnNames: columnNames,
                rowNames: rowNames,
                valueKey: this.valueKey
            });
        }
        else {
            columnNames = _.uniq(
                this.tableData.map(function(tableDataItem) {
                    return tableDataItem[self.columnKey];
                })
            );

            preparedData = prepareTwoDimensionalData({
                tableData: this.tableData,
                columnNames: columnNames,
                rowNames: rowNames,
                rowKey: this.rowKey,
                columnKey: this.columnKey,
                valueKey: this.valueKey
            });
        }

        this.$elem.append(renderTable(preparedData));
    }
};

module.exports = function(options) {
    var instance = Object.assign(Object.create(tablePrototype), eventablejs, options);

    instance.$elem = $('<div class="st-table"></div>');

    registerKeyUpListener(instance);

    instance.generate();

    return instance;
};
