var $            = require('jquery');
var d3           = require('d3');
var d3plus       = require('d3plus');
var eventablejs  = require('eventablejs');

var TableBuilder = require('./table-builder.class.js');

/* * /
var visualization = d3plus.viz()
.container('#viz')
.data(data)
.type('bar')
.id('name')
.x('year')
.y('value')
.draw();
/**/

var barHeaderTemplate =
    `<header>
        <div>
            <label>X-axis</label>
            <input type="text" name="x-axis-title" value="" />
        </div>
        <div>
            <label>Y-axis</label>
            <input type="text" name=y-axis-title" value="" />
        </div>
    </header>`;

function createBarHeader(chartBuilder) {
    var $elem = $(barHeaderTemplate);

    $elem.on('change', 'input[name="x-axis-title"]', function(e) {
        chartBuilder.setData({
            xAxisTitle: e.currentTarget.value
        });
    });

    $elem.on('change', 'input[name="y-axis-title"]', function(e) {
        chartBuilder.setData({
            yAxisTitle: e.currentTarget.value
        });
    });
}

var barData = [
    { year: 1991, name:'cake', value: 15 },
    { year: 1991, name:'fruit', value: 10 },
    { year: 1991, name:'gamma', value: 5 },
    { year: 1992, name:'cake', value: 20 },
    { year: 1992, name:'fruit', value: 10 },
    { year: 1992, name:'gamma', value: undefined },
    { year: 1993, name:'cake', value: 30 },
    { year: 1993, name:'fruit', value: 40 },
    { year: 1993, name:'gamma', value: 20 }
];

function createBar(chartBuilder, chartData) {
    // register trigger of show
    var table;

    table = new TableBuilder();

    chartBuilder.$tableArea.append(table.$elem);

    table.generate(barData);

    table.on('change:cell', function(e) {
        console.log(e);
    });

    table.on('change:header:row', function(e) {
        console.log(e);
    });

    table.on('change:header:column', function(e) {
        console.log(e);
    });
}

/* * /
var data = [
    { value: 100, name: "alpha" },
    { value: 70, name: "beta" },
    { value: 40, name: "gamma" },
    { value: 15, name: "delta" },
    { value: 5, name: "epsilon" },
    { value: 1, name: "zeta "}
];

d3plus.viz()
.container('#viz')
.data(data)
.type('pie')
.id('name')
.size('value')
.draw();
/**/


function createPie(chartBuilder) {

}

var ChartBuilder = function(params) {
    var self = this;
    this.id = Date.now();
    this.data = params.chartData;

    this.$elem = $('<div class="chart-builder"></div>');
    this.$chartArea = $('<div id="' + this.id + '" class="chart-area"></div>');
    this.$tableArea = $('<div class="table-area"></div>');

    this.$elem.append(this.$chartArea);
    this.$elem.append(this.$tableArea);

    if (params.chartType === 'pie') {
        createPie(this);
    }
    else if (params.chartType === 'bar') {
        createBar(this);
    }

    this.on('show', function() {
        self.$chartArea.show();
    });

    this.on('hide', function() {
        self.$chartArea.hide();
    });
};

ChartBuilder.prototype = Object.assign({
    setData: function(newData) {
        this.data = Object.assign(this.data, newData);

        var changedKeys = Object.keys(newData);

        this.trigger('update', changedKeys);
    }
}, eventablejs);

module.exports = ChartBuilder;
