import $           from 'etudiant-mod-dom';
import eventablejs from 'eventablejs';

import fetchChartLibs    from './library-fetcher.js';
import barChartPrototype from './bar.js';
import pieChartPrototype from './pie.js';

export default {
    create(params) {
        try {
            const _params = Object.assign({}, params);
            const extendPrototype = {};
            switch (_params.type) {
                case 'pie':
                    Object.assign(extendPrototype, pieChartPrototype);
                    break;
                case 'bar':
                    Object.assign(extendPrototype, barChartPrototype);
                    break;
                default:
                    throw new Error('params.type have to be set');
            }

            const id = 'chart-' + Date.now();
            const $elem = $('<div class="st-chart-builder"></div>');
            const $chartArea = $(`<div id="${id}" class="st-chart-area"></div>`);
            const $tableArea = $('<div class="st-table-area"></div>');

            $elem.append($chartArea);
            $elem.append($tableArea);

            const instance = Object.assign({}, this.prototype, extendPrototype, eventablejs, { id, $elem, $chartArea, $tableArea });

            fetchChartLibs()
            .then(() => {
                instance.generate(_params);
            })
            .catch(err => {
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
