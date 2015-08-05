var d3     = require('d3');
var d3plus = require('d3plus');
var Table  = require('../table/index.js');

function drawChart(pieChart) {
    d3plus.viz()
    .container('#' + pieChart.id)
    .data(pieChart.data)
    .type('pie')
    .id(pieChart.rowKey)
    .size(pieChart.valueKey)
    .draw();
}

function generateWithData(pieChart) {
    pieChart.table = Table.create({
        tableType: '1D',
        tableData: pieChart.data,
        columnKey: pieChart.columnKey,
        rowKey: pieChart.rowKey,
        valueKey: pieChart.valueKey
    });

    pieChart.$tableArea.append(pieChart.table.$elem);

    pieChart.d3chart = drawChart(pieChart);

    pieChart.table.on('update', function(newData) {
        pieChart.data = newData;

        drawChart(pieChart);
    });
}

function generateWithoutData(pieChart) {
    // @todo implement
}

var pieChartPrototype = {
    generate: function() {
        if (this.data) {
            generateWithData(this);
        }
        else {
            generateWithoutData(this);
        }
    }
};

module.exports = pieChartPrototype;
