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

function tableUpdated(tableBuilder, block) {
    var $chart = block.$inner.find('.st__chart');
    tableBuilder.data = tableBuilder.getDatas();

    tableBuilder.on('table:updated', function() {
        chartBuilderDisplay = this.display;

        chartBuilder = new ChartBuilder({
            data: this.data,
            type: this.chartType,
            block: block,
            display: chartBuilderDisplay,
            $elem: $chart
        });

        var toSave = {
            dataList: this.data,
            type: this.chartType,
            columns: this.columnsCount,
            categories: this.categoriesCount,
            columnsHeaderValues: this.columnsHeaderValues,
            rowsHeaderValues: this.rowsHeaderValues
        };
        Object.assign(this.block.blockStorage.data, toSave);
        chartBuilder.render();
    });
}

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


function onChoose(choices) {
    var chartType = choices.chartType;
    var $table = this.$inner.find('.st__chart-table');

    var tableBuilder = new TableBuilder({
        chartType: chartType,
        block: this,
        data: [],
        $elem: $table
    });

    tableReady(tableBuilder, this);
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

        var tableBuilder = new TableBuilder({
            chartType: data.type,
            block: this,
            data: data.dataList,
            $elem: $table,
            columnsHeaderValues: data.columnsHeaderValues,
            rowsHeaderValues: data.rowsHeaderValues
        });

        tableBuilder.columnsCount = data.columns;
        tableBuilder.categoriesCount = data.categories;
        tableBuilder.display = data.display;

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
