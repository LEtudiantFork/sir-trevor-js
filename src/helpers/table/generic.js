var $                   = require('jquery');
var dataKeyIsUnique     = require('./lib.js').dataKeyIsUnique;
var headerValueIsUnique = require('./lib.js').headerValueIsUnique;

var genericTablePrototype = {
    registerClickListeners: function() {
        if (this.hasRegisteredClick) {
            return false;
        }

        this.hasRegisteredClick = true;

        this.$elem.on('click', 'button[data-action="add-column"]', function(e) {
            this.addColumn();
        }.bind(this));

        this.$elem.on('click', 'button[data-action="add-row"]', function(e) {
            this.addRow();
        }.bind(this));

        this.$elem.on('click', 'button[data-type="row"]', function(e) {
            this.deleteRow($(e.currentTarget).data('key').toString());
        }.bind(this));

        this.$elem.on('click', 'button[data-type="column"]', function(e) {
            this.deleteColumn($(e.currentTarget).data('key').toString());
        }.bind(this));
    },

    updateDataKey: function(params) {
        if (dataKeyIsUnique(params.newKey, this.tableData)) {

            this[params.type] = params.newKey;

            this.trigger('update:key', {
                type: params.type,
                value: this[params.type]
            });

            this.tableData = this.tableData.map(function(tableDataItem) {
                var newTableDataItem = Object.assign({}, tableDataItem);

                delete newTableDataItem[params.oldKey];

                newTableDataItem[params.newKey] = tableDataItem[params.oldKey];

                return newTableDataItem;
            });

            this.trigger('update', this.tableData);
            this.render();
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
