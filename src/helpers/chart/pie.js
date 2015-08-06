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

        setTimeout(() => { this.drawChart() }, 0);

        this.table.on('update:key', newData => {
            this[newData.type] = newData.value;
        });

        this.table.on('update', newData => {
            this.data = newData;

            this.drawChart();
        });
    }
};

module.exports = pieChartPrototype;
