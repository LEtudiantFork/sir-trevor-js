import Table from '../table/index.js';

const mockData = [
    { valeur: 10, section: 'Section 1', hex: '#a22' },
    { valeur: 20, section: 'Section 2', hex: '#2a2' },
    { valeur: 30, section: 'Section 3', hex: '#22a' }
];

export default {
    type: 'pie',

    drawChart() {
        window.d3plus.viz()
        .container(`#${this.id}`)
        .data(this.data)
        .type(this.type)
        .margin('10px 20px')
        .id(this.rowKey)
        .size(this.valueKey)
        .color('hex')
        .draw();
    },

    generate() {
        this.data = this.data || mockData;
        this.rowKey = this.rowKey || 'section';
        this.valueKey = this.valueKey || 'valeur';

        this.table = Table.create({
            tableType: '1D',
            tableData: this.data,
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
            valueKey: this.valueKey,
            data: this.data,
            rowKey: this.rowKey,
            type: this.type
        };
    }
};
