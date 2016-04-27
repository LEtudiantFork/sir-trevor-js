import Table       from '../table';
import $           from 'etudiant-mod-dom';
import eventablejs from 'eventablejs';

import fetchChartLibs from './library-fetcher';
import prototype from './generic';

import MODEL from './model/bar';
import * as EVENTS from '../events';

function BarChart() {}

export default {
    create(params) {
        const _params = Object.assign({}, params);
        const instance = Object.assign(new BarChart(), eventablejs, prototype, this.prototype);

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
            .x(this.propKey)
            .y(this.valueKey)
            .id(this.refKey)
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

        generate({ refKey, propKey, valueKey, data, colors }) {
            this.type = MODEL.type;
            this.refKey = refKey || MODEL.refKey;
            this.propKey = propKey || MODEL.propKey;
            this.valueKey = valueKey || MODEL.valueKey;
            this.data = data || MODEL.data;
            this.colors = colors || MODEL.colors;

            this.table = Table.create({
                type: '2D',
                refKey: this.refKey,
                propKey: this.propKey,
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
                refKey: this.refKey,
                valueKey: this.valueKey,
                data: this.data,
                propKey: this.propKey,
                type: this.type
            };
        }
    }
};
