var $                 = require('jquery');
var _                 = require('../../lodash.js');
var renderTable       = require('./render.js').render2DTable;
var renderTableFooter = require('./render.js').renderTableFooter;
var getHeaderNames    = require('./lib.js').getHeaderNames;

function renderTableControls(params) {
    var template = [
        '<div>',
            '<div>',
                '<label><%= xAxisLabel %></label>',
                '<input type="text" data-cell-type="axis" data-axis-type="x-axis" value="<%= xAxisValue %>" data-old-value="<%= xAxisValue %>" />',
            '</div>',
            '<div>',
                '<label><%= yAxisLabel %></label>',
                '<input type="text" data-cell-type="axis" data-axis-type="y-axis" value="<%= yAxisValue %>" data-old-value="<%= yAxisValue %>" />',
            '</div>',
            '<button data-action="add-row">Ajouter une rangée</button>',
            '<button data-action="add-column">Ajouter une colonne</button>',
        '</div>'
    ].join('\n');

    return _.template(template, {
        xAxisLabel: 'X Axis',
        xAxisValue: params.xAxisValue,
        yAxisLabel: 'Y Axis',
        yAxisValue: params.yAxisValue
    });
}

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

        if (this._newColumnName) {
            this._newColumnCount++;
        }
        else {
            this._newColumnName = 'Nouvelle Colonne';
            this._newColumnCount = 1;
        }

        var newColumn = rowNames.map(function(rowName) {
            var newItem = {};

            newItem[this.valueKey] = 0;
            newItem[this.rowKey] = rowName;
            newItem[this.columnKey] = this._newColumnName + ' ' + this._newColumnCount;

            return newItem;
        }.bind(this));

        this.tableData = [].concat(this.tableData, newColumn);

        this.trigger('update', this.tableData);
        this.render();
    },

    addRow: function() {
        var columnNames = getHeaderNames(this.tableData, this.columnKey);

        if (this._newRowName) {
            this._newRowCount++;
        }
        else {
            this._newRowName = 'Nouvelle Rangée';
            this._newRowCount = 1;
        }

        var newRow = columnNames.map(function(columnName) {
            var newItem = {};

            newItem[this.valueKey] = 0;
            newItem[this.columnKey] = columnName;
            newItem[this.rowKey] = this._newRowName + ' ' + this._newRowCount;

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
                return tableDataItem[this.columnKey] !== columnName;
            }.bind(this));

            this.trigger('update', this.tableData);
            this.render();
        }
    },

    deleteRow: function(rowName) {
        var rowNames = getHeaderNames(this.tableData, this.rowKey);

        if (rowNames.length > 1) {
            this.tableData = this.tableData.filter(function(tableDataItem) {
                return tableDataItem[this.rowKey] !== rowName;
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

        this.$elem.append(renderTableControls({
            xAxisValue: this.rowKey,
            yAxisValue: this.valueKey
        }));

        this.$elem.append(renderTable(preparedData));
    },

    registerKeyUpListeners: function() {
        if (this.hasRegisteredKeyUp) {
            return false;
        }

        this.hasRegisteredKeyUp = true;

        this.$elem.on('keyup', _.debounce(function(e) {
            var $srcElement = $(e.originalEvent.srcElement);

            var cellType = $srcElement.data('cellType');

            if (cellType === 'row-header') {
                this.updateHeader({
                    headerKey: this.rowKey,
                    newValue: $srcElement.val().toString(),
                    oldValue: $srcElement.data('oldValue').toString()
                });
            }
            else if (cellType === 'column-header') {
                this.updateHeader({
                    headerKey: this.columnKey,
                    newValue: $srcElement.val().toString(),
                    oldValue: $srcElement.data('oldValue').toString()
                });
            }
            else if (cellType === 'axis') {
                var type;

                if ($srcElement.data('axisType') === 'x-axis') {
                    type = 'rowKey'
                }
                else if ($srcElement.data('axisType') === 'y-axis') {
                    type = 'valueKey'
                }

                this.updateDataKey({
                    type: type,
                    newKey: $srcElement.val(),
                    oldKey: $srcElement.data('oldValue').toString()
                });
            }
            else {
                this.updateCell({
                    newValue: parseInt($srcElement.val()),
                    row: $srcElement.data('coord').split('$')[0].toString(),
                    column: $srcElement.data('coord').split('$')[1].toString()
                });
            }
        }.bind(this), 400));
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
