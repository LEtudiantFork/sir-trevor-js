var dataKeyIsUnique     = require('./lib.js').dataKeyIsUnique;
var headerValueIsUnique = require('./lib.js').headerValueIsUnique;

var genericTablePrototype = {
    updateDataKey: function(params) {
        if (dataKeyIsUnique(params.newKey, this.tableData)) {

            if (this.columnKey === params.oldKey) {
                this.columnKey = params.newKey;
            }

            if (this.rowKey === params.oldKey) {
                this.rowKey = params.newKey;
            }

            if (this.valueKey === params.oldKey) {
                this.valueKey = params.newKey;
            }

            this.tableData = this.tableData.map(function(tableDataItem) {
                var newTableDataItem = Object.assign({}, tableDataItem);

                delete newTableDataItem[params.oldKey];

                newTableDataItem[params.newKey] = tableDataItem[params.oldKey];

                return newTableDataItem;
            });
        }
        else {
            this.trigger('error', 'unique');
        }
    },

    updateHeader: function(params) {
        if (!headerValueIsUnique(params.newValue, params.headerKey, this.tableData)) {
            this.trigger('error', 'unique');
        }
        else if (params.newValue === '') {
            this.trigger('error', 'empty')
        }
        else {
            this.tableData = this.tableData.map(function(tableDataItem) {
                if (tableDataItem[params.headerKey] === params.oldValue) {
                    tableDataItem[params.headerKey] = params.newValue;
                }

                return tableDataItem;
            }.bind(this));

            this.trigger('update', this.tableData);
        }

        this.render();
    }
};

module.exports = genericTablePrototype;
