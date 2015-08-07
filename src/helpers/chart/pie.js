var d3     = require('d3');
var d3plus = require('d3plus');
var Table  = require('../table/index.js');

var mockData = [
    { valeur: 10, section: 'Section 1' },
    { valeur: 20, section: 'Section 2' },
    { valeur: 30, section: 'Section 3' }
];

var pieChartPrototype = {
    drawChart: function() {
        d3plus.viz()
        .container('#' + this.id)
        .data(this.data)
        .type('pie')
        .id(this.rowKey)
        .margin('10px 20px')
        .size(this.valueKey)
        .draw();
    },

    generate: function() {
        this.type = 'pie';

        if (!this.data) {
            this.data = mockData;
            this.rowKey = 'section';
            this.valueKey = 'valeur';
        }

        this.table = Table.create({
            tableType: '1D',
            tableData: this.data,
            rowKey: this.rowKey,
            valueKey: this.valueKey
        });

        this.$tableArea.append(this.table.$elem);

        // need to wait for redraw otherwise d3plus doesn't find element
        setTimeout(function() { this.drawChart() }.bind(this), 0);

        this.table.on('update:key', function(newData) { this[newData.type] = newData.value; }.bind(this));

        this.table.on('update', function(newData) {
            this.data = newData;

            this.drawChart();
        }.bind(this));
    },

    getData: function() {
        return {
            valueKey: this.valueKey,
            data: this.data,
            rowKey: this.rowKey,
            type: this.type
        }
    }
};

module.exports = pieChartPrototype;
