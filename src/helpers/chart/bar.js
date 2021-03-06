var Table  = require('../table/index.js');

var mockData = [
    { colonne: 'Colonne 1', rangée:'Rangée 1', valeur: 15 },
    { colonne: 'Colonne 1', rangée:'Rangée 2', valeur: 10 },
    { colonne: 'Colonne 1', rangée:'Rangée 3', valeur: 5 },
    { colonne: 'Colonne 2', rangée:'Rangée 1', valeur: 20 },
    { colonne: 'Colonne 2', rangée:'Rangée 2', valeur: 10 },
    { colonne: 'Colonne 2', rangée:'Rangée 3', valeur: 0 },
];

var barChartPrototype = {
    drawChart: function() {
        window.d3plus.viz()
        .container('#' + this.id)
        .data(this.data)
        .type('bar')
        .margin( '10px 20px' )
        .id(this.columnKey)
        .x(this.rowKey)
        .y(this.valueKey)
        .draw();
    },

    generate: function() {
        this.type = 'bar';

        if (!this.data) {
            this.data = mockData;
            this.columnKey = 'colonne';
            this.rowKey = 'rangée';
            this.valueKey = 'valeur';
        }

        this.table = Table.create({
            tableType: '2D',
            tableData: this.data,
            columnKey: this.columnKey,
            rowKey: this.rowKey,
            valueKey: this.valueKey
        });

        this.$tableArea.append(this.table.$elem);

        // need to wait for redraw otherwise d3plus doesn't find element
        setTimeout(function() { this.drawChart() }.bind(this), 0);

        this.table.on('update:key', (newData) => { this[newData.type] = newData.value; });

        this.table.on('update', (newData) => {
            this.data = newData;

            this.drawChart();
        });
    },

    getData: function() {
        return {
            columnKey: this.columnKey,
            valueKey: this.valueKey,
            data: this.data,
            rowKey: this.rowKey,
            type: this.type
        }
    }

};

module.exports = barChartPrototype;
