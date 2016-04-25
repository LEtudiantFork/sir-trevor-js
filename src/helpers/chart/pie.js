import Table from '../table/index.js';

import MODEL from './model/pie';
import * as EVENTS from '../events';

export default {
    drawChart() {
        this.visualization = this.visualization || window.d3plus.viz().container(`#${this.id}`).type(this.type);
        this.visualization
        .data(this.data)
        .id(this.refKey)
        .size(this.valueKey)
        .height(this.$chartArea.outerWidth() * 0.75)
        .legend({
            align: 'start',
            order: {
                sort: 'asc',
                value: 'id'
            }
        })
        .attrs(this.colors)
        .color('color')
        .draw();
    },

    generate({ refKey, valueKey, data, colors }) {
        this.type = MODEL.type;
        this.refKey = refKey || MODEL.refKey;
        this.valueKey = valueKey || MODEL.valueKey;
        this.data = data || MODEL.data;
        this.colors = colors || MODEL.colors;

        this.table = Table.create({
            type: '1D',
            refKey: this.refKey,
            valueKey: this.valueKey,
            data: this.data,
            colors: this.colors
        });

        this.$tableArea.append(this.table.$elem);

        // need to wait for redraw otherwise d3plus doesn't find element
        setTimeout(() => this.drawChart(), 0);

        this.table.on(EVENTS.UPDATE.KEY, data => this[data.type] = data.value);

        this.table.on(EVENTS.UPDATE.COLOR, () => {
            this.colors = this.table.getColors();
            this.drawChart();
        });

        this.table.on(EVENTS.UPDATE.DATA, () => {
            this.colors = this.table.getColors();
            this.data = this.table.getData();
            this.drawChart();
        });
    },

    getData() {
        return {
            valueKey: this.valueKey,
            data: this.data,
            refKey: this.refKey,
            type: this.type
        };
    }
};
