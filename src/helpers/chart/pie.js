import Table       from '../table';
import $           from 'etudiant-mod-dom';
import eventablejs from 'eventablejs';

import fetchChartLibs from './library-fetcher.js';
import prototype from './generic.js';

import MODEL from './model/pie';
import * as EVENTS from '../events';

function PieChart() {}

export default {
    create(params) {
        const _params = Object.assign({}, params);

        const instance = Object.assign(new PieChart(), eventablejs, prototype, this.prototype);

        instance.id = 'chart-' + Date.now();
        instance.$elem = $('<div class="st-chart-builder"></div>');
        instance.$chartArea = $(`<div id="${instance.id}" class="st-chart-area"></div>`);
        instance.$tableArea = $('<div class="st-table-area"></div>');

        instance.$elem.append(instance.$chartArea);
        instance.$elem.append(instance.$tableArea);

        fetchChartLibs()
        .then(() => {
            instance.generate(_params);
        })
        .catch(err => {
            throw err;
        });

        return instance;
    },

    prototype: {
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

        generate({ refKey, valueKey, table, colors }) {
            this.type = MODEL.type;
            this.refKey = refKey || MODEL.refKey;
            this.valueKey = valueKey || MODEL.valueKey;
            this.data = table || MODEL.table;
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
                type: this.type,
                refKey: this.refKey,
                valueKey: this.valueKey,
                table: this.data
            };
        }
    }
};
