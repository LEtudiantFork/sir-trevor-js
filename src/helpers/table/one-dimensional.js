var renderTable       = require('./render.js').renderTable;
var renderTableFooter = require('./render.js').renderTableFooter;
var getHeaderNames    = require('./lib.js').getHeaderNames;

function prepareData(params) {
    var prepared = params.rowNames.map(function(rowName, index) {
        return [
            rowName,
            {
                coord: rowName + '$' + params.valueKey,
                value: params.tableData[index][params.valueKey]
            }
        ];
    });

    prepared.unshift(params.columnNames);

    return prepared;
}

var oneDimensionalTablePrototype = {
    addRow: function() {
        var newRow = {};

        newRow[this.valueKey] = '';
        newRow[this.rowKey] = '';

        this.tableData.push(newRow);

        this.trigger('update', this.tableData);
        this.render();
    },

    deleteRow: function(rowName) {
        if (this.tableData.length > 2) {
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
        var columnNames = [this.columnKey];
        var rowNames = getHeaderNames(this.tableData, this.rowKey);

        this.$elem.empty();

        var preparedData = prepareData({
            tableData: this.tableData,
            columnNames: columnNames,
            rowNames: rowNames,
            valueKey: this.valueKey
        });

        this.$elem.append(renderTable(preparedData));
        this.$elem.find('th input').attr('disabled', true);
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
                if (tableDataItem[this.rowKey] === params.row) {
                    tableDataItem[this.valueKey] = params.newValue;
                }

                return tableDataItem;
            }.bind(this));

            this.trigger('update', this.tableData);
        }
    }
};

module.exports = oneDimensionalTablePrototype;
