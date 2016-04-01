import $           from 'etudiant-mod-dom';
import eventablejs from 'eventablejs';

import barChartPrototype from './bar.js';
import pieChartPrototype from './pie.js';
import fetchChartLibs    from './library-fetcher.js';

export default {
    create({ type, data, rowKey, valueKey, columnKey }) {
        try {
            const extendPrototype = {};
            switch (type) {
                case 'pie':
                    Object.assign(extendPrototype, pieChartPrototype);
                    break;
                case 'bar':
                default:
                    Object.assign(extendPrototype, barChartPrototype);
            }

            const id = 'chart-' + Date.now();
            const $elem = $('<div class="st-chart-builder"></div>');
            const $chartArea = $(`<div id="${id}" class="st-chart-area"></div>`);
            const $tableArea = $('<div class="st-table-area"></div>');

            $elem.append($chartArea);
            $elem.append($tableArea);

            const params = {
                id,
                $elem,
                $chartArea,
                $tableArea,
                data,
                rowKey,
                valueKey,
                columnKey
            };

            const instance = Object.assign({}, this.prototype, extendPrototype, eventablejs, params);

            fetchChartLibs()
            .then(() => instance.generate())
            .catch(err => {
                console.log(err);
                throw err;
            });

            return instance;
        }
        catch (err) {
            console.log(err);
        }
    },

    prototype: {
        drawChart() {},

        generate() {},

        getData() {}
    }
};
