var _            = require('../lodash');
var $            = require('jquery');
var eventablejs  = require('eventablejs');


var tableTemplate = '<table class="chart-table"><%= headers %><%= content %> </table>';

var cellTemplate = '<td data-xaxis="<%= name %>" data-type="cell" data-yaxis="<%= column %>" contenteditable><%= value %></td>';

var barParams = [
    {
        name: 'colonne 1',
        column: 'serie 1',
        value: 8
    },
    {
        name: 'colonne 1',
        column: 'serie 2',
        value: 9
    },

    {
        name: 'colonne 2',
        column: 'serie 1',
        value: 10
    },
    {
        name: 'colonne 2',
        column: 'serie 2',
        value: 3
    }
];

var pieParams = [
    {
        name: 'colonne 1',
        column: 'serie 1',
        value: 8
    },
    {
        name: 'colonne 2',
        column: 'serie 1',
        value: 9
    }
];
/**
 * Create a table cell with a D3plus  data object
 */
function createTableCell(element){
    return _.template(cellTemplate, element);
}
/**
 * Create a table header
 *
 */
function createTableXaxisHeader(headersTable) {
    var headers = '<tr><th></th>';
    headersTable.forEach(function(element) {
        headers += '<th><input type="text" class="xaxis" data-xaxis="' + element + '" value="' + element + '"><span data-xaxis="' + element + '" class="remove-col"> - </span></th>';
    });
    headers += '</tr>';
    return headers;
}
/**
 * Build the HTML table
 */
function buildTable(params, tableBuilder) {
    var header = createTableXaxisHeader(tableBuilder.columnsHeaderValues);
    var rows = '';
    tableBuilder.rowsHeaderValues.forEach(function(rowValue) {
        var row = '';
        row += '<tr>';
        //prevent pieChart to build un-necessary label
        if ( tableBuilder.chartType === 'pie'){
            row += '<th></th>';
        }
        else {
            row += '<th><input class="yaxis" data-yaxis="' + rowValue + '" value="' + rowValue + ' " > <span data-yaxis="' + rowValue + '" class="remove-row">-</span></th>';
        }
        //Double loop to build the table.
        tableBuilder.columnsHeaderValues.forEach(function(colValue) {
             params.forEach(function(paramElement) {
                if (rowValue === paramElement.column && colValue === paramElement.name) {
                    row += createTableCell(paramElement);
                }
            });
        });
        row += '</tr>';
        rows += row;
    });
    //Last step, the empty table and the freshly build table inner take a ride.
    var table = _.template(tableTemplate, {
        content: rows,
        headers: header
    });

    return table;
}
/**
 * Depending on the columnModifiable or rowModifiable parameters add controls
 */
function addControls(tableBuilder) {
    if (tableBuilder.columnModifiable === true) {
        var addCol;
        if (tableBuilder.chartType === 'pie') {
            addCol = '<span class="control add-col"> ' + i18n.t('blocks:chart:pie:col+') + ' </span>';
        }
        else if (tableBuilder.chartType === 'bar') {
            addCol = '<span class="control add-col"> ' + i18n.t('blocks:chart:bar:col+') + ' </span>';
        }
    }
    else {
        addCol = ' ';
    }

    if (tableBuilder.rowModifiable === true) {
        var addRow = '<span class="control add-row"> ' + i18n.t('blocks:chart:row+') + ' </span>';
    }
    else {
        addRow = ' ';
    }

    var controls = _.template('<div class="table-controls"><%= row %><%= cell %></div>', {
        row: addRow,
        cell: addCol
    });

    tableBuilder.$elem.append(controls);
}

/**
 *  Add listenners on previously added controls
 */
function addControlsListenners(tableBuilder) {
    tableBuilder.$elem.find('.add-col').on('click', function(ev) {
        ev.stopPropagation();
        tableBuilder.addColumn();
    });

    tableBuilder.$elem.find('.add-row').on('click', function(ev) {
        ev.stopPropagation();
        tableBuilder.addRow();
    });

    tableBuilder.$elem.find('.remove-col').on('click', function(ev) {
        ev.stopPropagation();
        var dataName = $(this).data('xaxis');
        tableBuilder.deleteColumn(dataName);
    });

    tableBuilder.$elem.find('.remove-row').on('click', function(ev) {
        ev.stopPropagation();
        var column = $(this).data('yaxis');
        tableBuilder.deleteRow(column);
    });

}
/**
 * Update Labels
 */
function updateLabel(labelPosition, labelValue, arrayOflabels) {
    arrayOflabels[labelPosition] = labelValue;
    return arrayOflabels;
}
/**
 * Update values
 */
function updateValues(label, oldValue, toFind, tableBuilder) {
    tableBuilder.data.forEach(function(value){
        if (value[toFind] === oldValue) {
            value[toFind] = label;
        }
    });
}
/**
 * Add listenners on labels;
 */
function addLabelsListenners(tableBuilder) {

    $.each(tableBuilder.$elem.find('input.xaxis'), function(key) {
        $(this).on('blur', function() {
            var inputValue = $(this).val();
            var oldValue = tableBuilder.columnsHeaderValues[key];
            tableBuilder.columnsHeaderValues = updateLabel(key, inputValue, tableBuilder.columnsHeaderValues);
            updateValues(inputValue, oldValue, 'name', tableBuilder);
            tableBuilder.render();
            tableBuilder.trigger('table:updated');
        });
    });

    $.each(tableBuilder.$elem.find('input.yaxis'), function(key) {
        $(this).on('blur', function() {
            var inputValue = $(this).val();
            var oldValue = tableBuilder.rowsHeaderValues[key];
            tableBuilder.rowsHeaderValues = updateLabel(key, inputValue, tableBuilder.rowsHeaderValues);
            updateValues(inputValue, oldValue, 'column', tableBuilder);
            tableBuilder.render();
            tableBuilder.trigger('table:updated');
        });
    });
}
/**
 * Remove controls listenners
 */
function removeControlsListenners(tableBuilder) {
    tableBuilder.$elem.find('.add-col').off('click');
    tableBuilder.$elem.find('.add-row').off('click');

    tableBuilder.$elem.find('.remove-col').off('click');
    tableBuilder.$elem.find('.remove-row').off('click');
}
/**
 * No longer watch table updates
 */
function stopWatchChanges(tableBuilder) {
    tableBuilder.$scope.off('keyup', 'td');
}

/**
 * Bind listenner on every td in the scope.
 */
function watchChanges(tableBuilder) {

    tableBuilder.$scope.on('keyup', 'td', function(ev) {
        ev.preventDefault();
        //retrieve all data in the HTML table
        tableBuilder.data = tableBuilder.getDatas();

        tableBuilder.trigger('table:updated', this.data);
    });
}

/**
 *  return tableBuilder.data without element containning 'rowName'
 *
 */
function findObjectsByRowName(tableBuilder, rowName) {

    var filtered = tableBuilder.data.filter(function(elem) {
        return elem.column !== rowName;
    });
    return filtered;
}
/**
 *  return tableBuilder.data without element containning 'columnName'
 *
 */
function findObjectsByColumnName(tableBuilder, columnName) {
    var filtered = tableBuilder.data.filter(function(elem) {
        return elem.name !== columnName;
    });
    return filtered;
}
/**
 * Tablebuilder constructor
 *
 */
var TableBuilder = function(params) {
    this.init(params);
};

var prototype = {
    init: function(params) {
        this.chartType = params.chartType;
        this.data = params.data;
        this.$elem = params.$elem;
        this.block = params.block;
        if (params.chartType === 'bar') {
            this.columnsHeaderValues = params.columnsHeaderValues !== undefined ? params.columnsHeaderValues : [ 'colonne 1', 'colonne 2' ];
            this.rowsHeaderValues = params.rowsHeaderValues !== undefined ? params.rowsHeaderValues : [ 'serie 1', 'serie 2' ];
        }
        else if (params.chartType === 'pie') {
            this.columnsHeaderValues = params.columnsHeaderValues !== undefined ? params.columnsHeaderValues : [ 'colonne 1', 'colonne 2' ];
            this.rowsHeaderValues = params.rowsHeaderValues !== undefined ? params.rowsHeaderValues : [ 'serie 1' ];
        }
        this.prepare();
        this.render();
    },

    getDatas: function() {
        var params = [];
        var $catArray = this.$scope.find('[data-type="cell"]');

        $.each($catArray, function() {
            var obj = {
                value: parseInt($(this).html()),
                name: $(this).data('xaxis').toString(),
                column: $(this).data('yaxis').toString()
            };
            params.push(obj);
        });
        return params;
    },

    addColumn: function() {
        var datas = [];
        //Add a placeholder columns element
        this.columnsHeaderValues.push('colonne ' + (this.columnsCount + 1));

        for (var i = 1; i <= this.categoriesCount; i++) {
            //Create & push empty object's in the datas array
                datas.push({
                name: this.columnsHeaderValues[this.columnsCount],
                column: this.rowsHeaderValues[i - 1],
                value: 0
            });
        }

        this.columnsCount++;
        if (this.data.length === 0) {
            this.data = this.getDatas();
        }
        // concat new objects in this.data
        this.data = this.data.concat(datas);
        this.render();
        addLabelsListenners(this);
        stopWatchChanges(this);
        watchChanges(this);
    },

    addRow: function() {

        var datas = [];
        //Add a placeholder row element
        this.rowsHeaderValues.push('serie ' + (this.categoriesCount + 1));

        for (var i = 1; i <= this.columnsCount; i++) {
                //Create & push empty object's in the datas array
                datas.push({
                name: this.columnsHeaderValues [i - 1],
                column: this.rowsHeaderValues[this.categoriesCount],
                value: 0
            });
        }

        this.categoriesCount++;

        if (this.data.length === 0) {
            this.data = this.getDatas();
        }
        // concat new objects in this.data
        this.data = this.data.concat(datas);

        this.render();

        addLabelsListenners(this);
        stopWatchChanges(this);
        watchChanges(this);
    },

    deleteRow: function(rowName) {
        // check if we can remove more items
        if (this.categoriesCount - 1 < this.minCategoriesCount) {
            this.block.addMessage(i18n.t('blocks:chart:no-deletion-col'), 'st-block-displaying-message');
            var that = this;
            window.setTimeout(function() {
                that.block.resetMessages();
                }, 3000
            );
            return;
        }

        var filtered = findObjectsByRowName(this, rowName);
        this.data = filtered;
        //Update the headers array
        this.rowsHeaderValues = this.rowsHeaderValues.filter(function(elem) {
            return elem !== rowName;
        });

        this.categoriesCount--;
        //Now all data's are set we can rebder the table
        this.render();
        this.trigger('table:updated', this.data);

        addLabelsListenners(this);
        stopWatchChanges(this);
        watchChanges(this);

    },

    deleteColumn: function(colNumber) {

        if (this.columnsCount - 1 < this.minColumnsCount) {
            this.block.addMessage(i18n.t('blocks:chart:no-deletion-line'), 'st-block-displaying-message');
            var that = this;
            window.setTimeout(function() {
                that.block.resetMessages();
                }, 3000
            );
            return;
        }
        this.datas = this.getDatas();


        var filtered = findObjectsByColumnName(this, colNumber);
        this.data = filtered;

        this.columnsHeaderValues = this.columnsHeaderValues.filter(function(elem) {
            return elem !== colNumber;
        });

        this.columnsCount--;

        this.trigger('table:updated', this.data);
        this.render();

        addLabelsListenners(this);
        stopWatchChanges(this);
        watchChanges(this);

    },
    /**
     * Bootstrap the chart wen needed, set placeholders values to  prevent the empty chart
     *
     */
    prepare: function() {

        var tableHtml;

        if (this.chartType === 'bar') {
            //Set min values
            this.minColumnsCount = 2;
            this.minCategoriesCount = 2;
            this.maxColumnsCount = 5; // my bad this line need to be removed

            //Build tableHtml with ST-block data or placeholder values if needed;
            if (this.data.length === 0) {
                this.columnsCount = this.minColumnsCount;
                this.categoriesCount = this.minCategoriesCount;
                tableHtml = buildTable(barParams, this);
            }
            else {
                tableHtml = buildTable(this.data, this);
            }
            this.columnModifiable = true;
            this.rowModifiable = true;
        }
        //Same as before bootstrap with pir chart configuration this time
        if (this.chartType === 'pie') {
            this.minColumnsCount = 2;
            this.minCategoriesCount = 1;

            if (this.data.length === 0) {
                this.columnsCount = this.minColumnsCount;
                this.categoriesCount = this.minCategoriesCount;

                tableHtml = buildTable(pieParams, this);
            }
            else {
                tableHtml = buildTable(this.data, this);
            }
            this.columnModifiable = true;
            this.rowModifiable = false;
        }

        if (this.$elem.length !== 0) {
            this.$elem.empty();
        }

        addControls(this);

        return tableHtml;
    },

    render: function() {
        var tableHtml = this.prepare();

        this.$elem.append(tableHtml);
        this.$scope = this.$elem.find('.chart-table'); // Scope all the table
        watchChanges(this);
        addLabelsListenners(this);
        addControlsListenners(this);
        this.data = this.getDatas(); //Update tablebuilder data after all modifications.
    },

    destroy: function(){
        removeControlsListenners(this);
    }
};

TableBuilder.prototype = Object.assign({}, prototype, eventablejs);

module.exports = TableBuilder;
