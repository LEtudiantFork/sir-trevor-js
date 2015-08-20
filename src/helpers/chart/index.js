var $           = require('etudiant-mod-dom');
var eventablejs = require('eventablejs');

var chartPrototype    = require('./generic.js');

var barChartPrototype = require('./bar.js');
var pieChartPrototype = require('./pie.js');

module.exports = {
    create: function(params) {
        var instance;

        if (params.type === 'pie') {
            function PieChart() {}

            instance = new PieChart();

            instance = Object.assign(instance, chartPrototype, pieChartPrototype, eventablejs);
        }
        else if (params.type === 'bar') {
            function BarChart() {}

            instance = new BarChart();

            instance = Object.assign(instance, chartPrototype, barChartPrototype, eventablejs);
        }

        instance.id = 'chart-' + Date.now();
        instance.data = params.data;

        instance.rowKey = params.rowKey;
        instance.valueKey = params.valueKey;
        instance.columnKey = params.columnKey;

        instance.$elem = $('<div class="chart-builder"></div>');

        instance.$chartArea = $('<div id="' + instance.id + '" class="chart-area"></div>');
        instance.$tableArea = $('<div class="table-area"></div>');

        instance.$elem.append(instance.$chartArea);
        instance.$elem.append(instance.$tableArea);

        instance.generate();

        return instance;
    }
};
