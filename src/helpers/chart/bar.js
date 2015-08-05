var d3     = require('d3');
var d3plus = require('d3plus');
var Table  = require('../table/index.js');

function drawChart(barChart) {
    d3plus.viz()
    .container('#' + barChart.id)
    .data(barChart.data)
    .type('bar')
    .id(barChart.columnKey)
    .x(barChart.rowKey)
    .y(barChart.valueKey)
    .draw();
}

function generateWithData(barChart) {
    barChart.table = Table.create({
        tableType: '2D',
        tableData: barChart.data,
        columnKey: barChart.columnKey,
        rowKey: barChart.rowKey,
        valueKey: barChart.valueKey
    });

    barChart.$tableArea.append(barChart.table.$elem);

    barChart.d3chart = drawChart(barChart);

    barChart.table.on('update', function(newData) {
        barChart.data = newData;

        drawChart(barChart);
    });
}

function generateWithoutData(pieChart) {
    // @todo implement
}

var barChartPrototype = {
    generate: function() {
        if (this.data) {
            generateWithData(this);
        }
        else {
            generateWithoutData(this);
        }
    }
};

module.exports = barChartPrototype;
