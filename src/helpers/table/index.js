var $           = require('jquery');
var _           = require('../../lodash.js');
var eventablejs = require('eventablejs');

var genericTablePrototype = require('./generic.js');
var oneDimensionalTablePrototype = require('./one-dimensional.js');
var twoDimensionalTablePrototype = require('./two-dimensional.js');

function registerKeyUpListener(table) {
    table.$elem.on('keyup', _.debounce(function keyUpListener(e) {
        var $srcElement = $(e.originalEvent.srcElement);

        var cellType = $srcElement.data('cellType');

        if (cellType === 'row-header') {
            table.updateHeader({
                headerKey: table.rowKey,
                newValue: $srcElement.val(),
                oldValue: $srcElement.data('oldValue')
            });
        }
        else if (cellType === 'column-header') {
            table.updateHeader({
                headerKey: table.columnKey,
                newValue: $srcElement.val(),
                oldValue: $srcElement.data('oldValue')
            });
        }
        else {
            table.updateCell({
                newValue: parseInt($srcElement.val()),
                row: $srcElement.data('coord').split('$')[0].toString(),
                column: $srcElement.data('coord').split('$')[1].toString()
            });
        }
    }, 400));
}

function clickListener(table) {
    table.$elem.on('click', 'tbody button[type="button"]', function(e) {
        table.deleteRow($(e.currentTarget).data('key'));
    });

    table.$elem.on('click', 'tfoot button[type="button"]', function(e) {
        table.deleteColumn($(e.currentTarget).data('key'));
    });
}

module.exports = {
    create: function(options) {
        var instance;

        if (options.tableType === '1D') {
            function OneDimensionalTable() {}

            instance = new OneDimensionalTable();

            instance = Object.assign(instance, genericTablePrototype, oneDimensionalTablePrototype, eventablejs, options);
        }
        else if (options.tableType === '2D') {
            function TwoDimensionalTable() {}

            instance = new TwoDimensionalTable();

            instance = Object.assign(instance, genericTablePrototype, twoDimensionalTablePrototype, eventablejs, options);
        }

        instance.$elem = $('<div class="st-table"></div>');

        instance.on('update', function(newData) {
            console.table(newData);
        });

        instance.on('error', function(error) {
            console.error(error);
        });

        registerKeyUpListener(instance);

        clickListener(instance);

        instance.render();

        return instance;
    }
};
