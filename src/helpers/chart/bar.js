import Table from '../table/index.js';

const mockData = [
    { colonne: 'Colonne 1', rangée:'Rangée 1', valeur: 15 },
    { colonne: 'Colonne 1', rangée:'Rangée 2', valeur: 10 },
    { colonne: 'Colonne 1', rangée:'Rangée 3', valeur: 5 },
    { colonne: 'Colonne 2', rangée:'Rangée 1', valeur: 20 },
    { colonne: 'Colonne 2', rangée:'Rangée 2', valeur: 10 },
    { colonne: 'Colonne 2', rangée:'Rangée 3', valeur: 0 }
];

export default {
    type: 'bar',

    drawChart() {
        window.d3plus.viz()
        .container(`#${this.id}`)
        .data(this.data)
        .type(this.type)
        .margin('10px 20px')
        .id(this.columnKey)
        .x(this.rowKey)
        .y(this.valueKey)
        .draw();
    },

    generate() {
        this.data = this.data || mockData;
        this.columnKey = this.columnKey || 'colonne';
        this.rowKey = this.rowKey || 'rangée';
        this.valueKey = this.valueKey || 'valeur';

        this.table = Table.create({
            tableType: '2D',
            tableData: this.data,
            columnKey: this.columnKey,
            rowKey: this.rowKey,
            valueKey: this.valueKey
        });

        this.$tableArea.append(this.table.$elem);

        // need to wait for redraw otherwise d3plus doesn't find element
        setTimeout(() => this.drawChart(), 0);

        this.table.on('update:key', data => this[data.type] = data.value);

        this.table.on('update', data => {
            this.data = data;
            this.drawChart();
        });
    },

    getData() {
        return {
            columnKey: this.columnKey,
            valueKey: this.valueKey,
            data: this.data,
            rowKey: this.rowKey,
            type: this.type
        };
    }

};
