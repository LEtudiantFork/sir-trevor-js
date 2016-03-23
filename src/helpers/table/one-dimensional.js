var $                 = require('etudiant-mod-dom').default;
var _                 = require('../../lodash.js');
var renderTable       = require('./render.js').render1DTable;
var renderTableFooter = require('./render.js').renderTableFooter;
var getHeaderNames    = require('./lib.js').getHeaderNames;

function renderTableControls() {
    return [
        '<div>',
            '<button type="button" data-action="add-row">Ajouter une rangée</button>',
        '</div>'
    ].join('\n');
}

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

    prepared.unshift([params.valueKey]);

    return prepared;
}

var oneDimensionalTablePrototype = {
    addRow: function() {
        var newRow = {};

        if (this._newRowName) {
            this._newRowCount++;
        }
        else {
            this._newRowName = 'Nouvelle Section'; // @todo i18n
            this._newRowCount = 1;
        }

        newRow[this.valueKey] = 0;
        newRow[this.rowKey] = this._newRowName + ' ' + this._newRowCount;

        this.tableData.push(newRow);

        this.trigger('update', this.tableData);
        this.render();
    },

    deleteRow: function(rowName) {
        this.tableData = this.tableData.filter((tableDataItem) => {
            if (tableDataItem[this.rowKey] === rowName) {
                return false;
            }
            else {
                return true;
            }
        });

        this.trigger('update', this.tableData);
        this.render();
    },

    render: function() {
        var rowNames = getHeaderNames(this.tableData, this.rowKey);

        this.$elem.empty();

        var preparedData = prepareData({
            tableData: this.tableData,
            rowNames: rowNames,
            valueKey: this.valueKey
        });

        this.$elem.append(renderTableControls());

        this.$elem.append(renderTable(preparedData));
    },

    registerKeyUpListeners: function() {
        if (this.hasRegisteredKeyUp) {
            return false;
        }

        this.hasRegisteredKeyUp = true;

        this.$elem.on('keyup', _.debounce((e) => {
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
                this.updateDataKey({
                    type: 'valueKey',
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
        }, 400));
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
            this.tableData = this.tableData.map((tableDataItem) => {
                if (tableDataItem[this.rowKey] === params.row) {
                    tableDataItem[this.valueKey] = params.newValue;
                }

                return tableDataItem;
            });

            this.trigger('update', this.tableData);
        }
    }
};

module.exports = oneDimensionalTablePrototype;
