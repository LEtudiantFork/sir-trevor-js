'use strict';

/*
  Chart Block
*/

var Block        = require('../block');
var TableBuilder = require('../helpers/tableBuilder.class.js');
var ChartBuilder = require('../helpers/chartBuilder.class.js');
var chartBuilder;
var chartBuilderDisplay;

var chooseableConfig = {
    'name': 'chartType',
    'options': [
        {
            'icon': 'pie',
            'title': 'Camembert',
            'value': 'pie'
        },
        {
            'icon': 'bar',
            'title': 'Barre',
            'value': 'bar'
        }
    ]
};
/**
 * triggered by the  "table:updated" event, instantiate chartbuilder, then save datas to ST block
 * @param  {object} tableBuilder [description]
 * @param  {object} block        [description]
 */
function tableUpdated(tableBuilder, block) {
    //Container for the svg
    var $chart = block.$inner.find('.st__chart');
    //Update datas in tablebuilder with the html table
    tableBuilder.data = tableBuilder.getDatas();

    tableBuilder.on('table:updated', function() {
        //Set the display mode (letters or numeric)
        chartBuilderDisplay = this.display;

        //instantiate the block chartbuilder
        chartBuilder = new ChartBuilder({
            data: this.data,
            type: this.chartType,
            block: block,
            display: chartBuilderDisplay,
            $elem: $chart
        });

        //Prepare datas to be stored.
        var toSave = {
            dataList: this.data,
            type: this.chartType,
            columns: this.columnsCount,
            categories: this.categoriesCount,
            columnsHeaderValues: this.columnsHeaderValues,
            rowsHeaderValues: this.rowsHeaderValues
        };

        Object.assign(this.block.blockStorage.data, toSave);
        // render the chart
        chartBuilder.render();
    });
}
/**
 *  Run on block init, do the same job as tableUpdated but only at chart loading.
 */
function tableReady(tableBuilder, block) {
    var $chart = block.$inner.find('.st__chart');
    tableBuilder.data = tableBuilder.getDatas();

    chartBuilderDisplay = tableBuilder.display;

    chartBuilder = new ChartBuilder({
        data: tableBuilder.data,
        type: tableBuilder.chartType,
        block: block,
        $elem: $chart,
        display: chartBuilderDisplay
    });

    var toSave = {
        dataList: tableBuilder.data,
        type: tableBuilder.chartType,
        columns: tableBuilder.columnsCount,
        categories: tableBuilder.categoriesCount,
        columnsHeaderValues: tableBuilder.columnsHeaderValues,
        rowsHeaderValues: tableBuilder.rowsHeaderValues
    };
    Object.assign(tableBuilder.block.blockStorage.data, toSave);
    chartBuilder.render();
}

/**
 *  Run on creation of a new block.
 */
function onChoose(choices) {
    //Set the chart type
    var chartType = choices.chartType;
    //table container
    var $table = this.$inner.find('.st__chart-table');
    //Instantiate tablebuilder if its a new block
    var tableBuilder = new TableBuilder({
        chartType: chartType,
        block: this,
        data: [],
        $elem: $table
    });
    // Source of the table ready event
    tableReady(tableBuilder, this);
    // Source of the table updated event
    tableUpdated(tableBuilder, this);
}

module.exports = Block.extend({

    chooseable: true,

    type: 'Chart',

    title: function() {
        return 'Chart';
    },

    editorHTML: '<div class="st__chart-informations"></div><div class="st__chart"></div><div class="st__chart-table"></div>',

    icon_name: 'chartpie',

    loadData: function(data) {
        var $table = this.$inner.find('.st__chart-table');

        //Instantiate tablebuilder for a loaded block
        var tableBuilder = new TableBuilder({
            chartType: data.type,
            block: this,
            data: data.dataList,
            $elem: $table,
            //Array with all columns labels
            columnsHeaderValues: data.columnsHeaderValues,
            //Array with all the rows labels
            rowsHeaderValues: data.rowsHeaderValues
        });

        tableBuilder.columnsCount = data.columns;
        tableBuilder.categoriesCount = data.categories;
        tableBuilder.display = data.display;
        //Bind the tablenuilder to  the chart block
        this.tableBuilder = tableBuilder;
    },

    onBlockRender: function() {

        if (this.tableBuilder) {
            this.tableBuilder.render();
            tableReady(this.tableBuilder, this);
            tableUpdated(this.tableBuilder, this);

        }
        else {
            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
    }
});
