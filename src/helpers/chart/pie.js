import Table from '../table/index.js';

const mockData = [
    { valeur: 10, section: 'Section 1' },
    { valeur: 20, section: 'Section 2' },
    { valeur: 30, section: 'Section 3' }
];

export default {
    drawChart() {
        window.d3plus.viz()
        .container('#' + this.id)
        .data(this.data)
        .type(this.type)
        .id(this.rowKey)
        .margin('10px 20px')
        .size(this.valueKey)
        .draw();
    },

    generate() {
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
        }
    }
};
