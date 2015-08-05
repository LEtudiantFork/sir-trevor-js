var renderTable       = require('./render.js').renderTable;
var renderTableFooter = require('./render.js').renderTableFooter;
var getHeaderNames    = require('./lib.js').getHeaderNames;

function getValue(params) {
    var result = params.rawData.filter(function(rawDataItem) {
        return rawDataItem[params.rowKey] === params.rowProp && rawDataItem[params.columnKey] === params.columnProp;
    })[0];

    return result[params.valueKey];
}

function prepareData(params) {
    var prepared = params.rowNames.map(function(rowName) {
        var preparedRow = [];

        preparedRow.push(rowName);

        params.columnNames.forEach(function(columnName) {
            preparedRow.push({
                coord: rowName + '$' + columnName,
                value: getValue({
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

var twoDimensionalTablePrototype = {
    addColumn: function() {
        var rowNames = getHeaderNames(this.tableData, this.rowKey);

        var newColumn = rowNames.map(function(rowName) {
            var newItem = {
                value: ''
            };

            newItem[this.rowKey] = rowName;
            newItem[this.columnKey] = '';

            return newItem;
        }.bind(this));

        this.tableData = [].concat(this.tableData, newColumn);

        this.trigger('update', this.tableData);
        this.render();
    },

    addRow: function() {
        var columnNames = getHeaderNames(this.tableData, this.columnKey);

        var newRow = columnNames.map(function(columnName) {
            var newItem = {
                value: ''
            };

            newItem[this.columnKey] = columnName;

            newItem[this.rowKey] = '';

            return newItem;
        }.bind(this));

        this.tableData = [].concat(this.tableData, newRow);

        this.trigger('update', this.tableData);
        this.render();
    },

    deleteColumn: function(columnName) {
        var columnNames = getHeaderNames(this.tableData, this.columnKey);

        if (columnNames.length > 1) {
            this.tableData = this.tableData.filter(function(tableDataItem) {
                if (tableDataItem[this.columnKey] === columnName) {
                    return false;
                }
                else {
                    return true;
                }
            }.bind(this));

            this.trigger('update', this.tableData);
            this.render();
        }
    },

    deleteRow: function(rowName) {
        var rowNames = getHeaderNames(this.tableData, this.rowKey);

        if (rowNames.length > 1) {
            this.tableData = this.tableData.filter(function(tableDataItem) {
                if (tableDataItem[this.rowKey] === rowName) {
                    return false;
                }
                else {
                    return true;
                }
            }.bind(this));

            this.trigger('update', this.tableData);
            this.render();
        }
    },

    render: function() {
        var rowNames = getHeaderNames(this.tableData, this.rowKey);
        var columnNames = getHeaderNames(this.tableData, this.columnKey);

        this.$elem.empty();

        var preparedData = prepareData({
            tableData: this.tableData,
            columnNames: columnNames,
            rowNames: rowNames,
            rowKey: this.rowKey,
            columnKey: this.columnKey,
            valueKey: this.valueKey
        });

        this.$elem.append(renderTable(preparedData));
    },

    updateCell: function(params) {
        if (params.newValue === '') {
            this.trigger('error', 'empty');
            this.render();
        }
        else if (isNaN(params.newValue)) {
            this.trigger('error', 'number');
            this.render();
        }
        else {
            this.tableData = this.tableData.map(function(tableDataItem) {
                if (tableDataItem[this.rowKey] === params.row && tableDataItem[this.columnKey] === params.column) {
                    tableDataItem[this.valueKey] = params.newValue;
                }

                return tableDataItem;
            }.bind(this));

            this.trigger('update', this.tableData);
        }
    }
};

module.exports = twoDimensionalTablePrototype;
