import $           from 'etudiant-mod-dom';
import eventablejs from 'eventablejs';

import chartPrototype    from './generic.js';
import barChartPrototype from './bar.js';
import pieChartPrototype from './pie.js';

export default {
    create: function({ type, data, rowKey, valueKey, columnKey }) {
        const instance = Object.assign({}, chartPrototype);

        if (type === 'pie') {
            Object.assign(instance, pieChartPrototype);
        }
        else if (type === 'bar') {
            Object.assign(instance, barChartPrototype);
        }

        const id = 'chart-' + Date.now();
        const $elem = $('<div class="chart-builder"></div>');
        const $chartArea = $(`<div id="${id}" class="chart-area"></div>`);
        const $tableArea = $('<div class="table-area"></div>');

        Object.assign(instance, eventablejs, { id, $elem, $chartArea, $tableArea, data, rowKey, valueKey, columnKey });
        $elem.append($chartArea);
        $elem.append($tableArea);
        instance.generate();

        return instance;
    }
};
