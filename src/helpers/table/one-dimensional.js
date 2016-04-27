import $ from 'etudiant-mod-dom';
import eventablejs from 'eventablejs';

import * as EVENTS from '../events';

import {
    renderADD,
    renderDELETE,
    renderINPUT,
    renderCOLOR,
    renderTABLE,
    renderTHEAD,
    renderTBODY,
    renderTFOOT,
    renderTR,
    renderTH,
    renderTD
} from './render.js';

import prototype from './generic.js';
import { getColor } from './lib.js';

function renderTable({ data, refKey, valueKey, colors }) {
    const rowsCount = data.length;

    const thead = renderTHEAD(
        renderTR(`
            ${renderTH('', 'colspan="2"')}
            ${renderTH(renderINPUT({ value: valueKey, cell: 'pie' }))}
        `)
    );

    const trows = data.reduce((prev, item) => {
        const ref = item[refKey];
        const value = item[valueKey];
        const color = getColor(colors, refKey, ref);

        return `
        ${prev}
        ${renderTR(`
            ${renderTD(renderINPUT({ value: ref, cell: 'ref-header' }))}
            ${renderTD(renderCOLOR({ value: color, ref }))}
            ${renderTD(renderINPUT({ type: 'number', value, ref }))}
            ${renderTD(rowsCount > 1 ? renderDELETE({ key: ref, action: 'ref' }) : '')}
        `)}`;
    }, '');

    const tbody = renderTBODY(trows);

    const tfoot = renderTFOOT(
        renderTR(`
            ${renderTD(renderADD({ action: 'ref', content: i18n.t('blocks:table1D:addRef') }), 'colspan="2"')}
        `)
    );

    return renderTABLE(`
        ${thead}
        ${tbody}
        ${tfoot}
    `);
}

function OneDimensionalTable() {}

export default {
    create({ refKey, valueKey, data, colors }) {
        const instance = Object.assign(new OneDimensionalTable(), eventablejs, prototype, this.prototype);

        instance.refKey = refKey;
        instance.valueKey = valueKey;
        instance.data = data;
        instance.colors = colors;

        instance.$elem = $('<div class="st-block--table st-chart__table"></div>');

        instance.registerInputListeners();
        instance.registerClickListeners();

        instance.render();

        return instance;
    },

    prototype: {
        addRef() {
            this.newRefIndex = this.newRefIndex + 1 || this.data.length + 1;

            const ref = `${i18n.t('blocks:table1D:newRef')} ${this.newRefIndex}`;
            const value = 0;
            const color = '#222222';

            this.data.push({
                [this.refKey]: ref,
                [this.valueKey]: value
            });
            this.colors.push({
                [this.refKey]: ref,
                color
            });

            this.trigger(EVENTS.UPDATE.DATA);
            this.render();
        },

        deleteRef(ref) {
            this.data = this.data.filter(item => item[this.refKey] !== ref);
            this.trigger(EVENTS.UPDATE.DATA);
            this.render();
        },

        render() {
            this.$elem.html(renderTable({
                data:this.data,
                refKey: this.refKey,
                valueKey: this.valueKey,
                colors: this.colors
            }));
        },

        updateCell({ ref, newValue }) {
            this.data.forEach(item => {
                if (item[this.refKey] === ref) {
                    item[this.valueKey] = newValue;
                }
            });
        }
    }
};
