import $           from 'etudiant-mod-dom';
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
import { getHeaderNames, getColor } from './lib.js';

function renderControls({ prop, value }) {
    return `
    <hr/>
    <div>
        <label>${i18n.t('blocks:table2D:axisX')}</label>
        ${renderINPUT({ value: prop, cell: 'prop-axis' })}
        <label>${i18n.t('blocks:table2D:axisY')}</label>
        ${renderINPUT({ value: value, cell: 'value-axis' })}
    </div>
    <hr/>
    `;
}

function getItem({ data, propKey, prop, refKey, ref }) {
    return data.filter(item => item[propKey] === prop && item[refKey] === ref).shift();
}

function renderTable({ data, colors, refKey, propKey, valueKey }) {
    const props = getHeaderNames(data, propKey);
    const propsCount = props.length;
    const lastProp = propsCount - 1;

    const trowHead = renderTR(
        props.reduce((prev, prop, index) => {
            return `
            ${prev}
            ${renderTH(renderINPUT({ value: prop, cell: 'prop-header' }))}
            ${index === lastProp ? renderTH(renderADD({ action: 'prop', content: i18n.t('blocks:table2D:addProp') })) : ''}
            `;
        }, renderTH('', 'colspan="2"'))
    );

    const thead = renderTHEAD(trowHead);

    const trowFoot = renderTR(
        props.reduce((prev, prop) => {
            return `
            ${prev}
            ${renderTD(propsCount > 1 ? renderDELETE({ key: prop, action: 'prop' }) : '')}
            `;
        }, renderTD(renderADD({ action: 'ref', content: i18n.t('blocks:table2D:addRef') }), 'colspan="2"')
    ));

    const tfoot = renderTFOOT(trowFoot);

    const refs = getHeaderNames(data, refKey);
    const refsCount = refs.length;

    /* */
    const trows = refs.reduce((prev, ref) => {
        const color = getColor(colors, refKey, ref);

        return `
        ${prev}
        ${renderTR(`
            ${renderTD(renderINPUT({ value: ref, cell: 'ref-header' }))}
            ${renderTD(renderCOLOR({ value: color, ref: ref }))}
            ${props.reduce((prev, prop) => {
                const item = getItem({ data, refKey, ref, propKey, prop });
                const value = item[valueKey];

                return `
                ${prev}
                ${renderTD(renderINPUT({ type: 'number', value, ref, prop }))}
                `;
            }, '')}
            ${renderTD(refsCount > 1 ? renderDELETE({ key: ref, action: 'ref' }) : '')}
        `)}`;
    }, '');
    /* */
    const tbody = renderTBODY(trows);

    return renderTABLE(`
        ${thead}
        ${tbody}
        ${tfoot}
    `);
}

function TwoDimensionalTable() {}

export default {
    create({ refKey, propKey, valueKey, data, colors }) {
        const instance = Object.assign(new TwoDimensionalTable(), eventablejs, prototype, this.prototype);

        instance.refKey = refKey;
        instance.propKey = propKey;
        instance.valueKey = valueKey;
        instance.data = data;
        instance.colors = colors;

        instance.$elem = $('<div class="st-two-dimensional"></div>');

        instance.registerInputListeners();
        instance.registerClickListeners();

        instance.render();

        return instance;
    },


    prototype: {
        addRef() {
            this.newRefIndex = this.newRefIndex + 1 || getHeaderNames(this.data, this.refKey).length;

            const ref = `${i18n.t('blocks:table2D:newRef')} ${this.newRefIndex}`;
            const value = 0;
            const color = '#222222';

            getHeaderNames(this.data, this.propKey).forEach(prop => {
                this.data.push({
                    [this.propKey]: prop,
                    [this.refKey]: ref,
                    [this.valueKey]: value
                });
            });

            this.colors.push({
                [this.refKey]: ref,
                color
            });

            this.trigger(EVENTS.updateData);
            this.render();
        },

        deleteRef(ref) {
            this.data = this.data.filter(item => item[this.refKey] !== ref);
            this.colors = this.colors.filter(item => item[this.refKey] !== ref);
            this.trigger(EVENTS.updateData);
            this.render();
        },

        addProp() {
            this.newPropIndex = this.newPropIndex + 1 || getHeaderNames(this.data, this.propKey).length;

            const prop = `${i18n.t('blocks:table2D:newProp')} ${this.newPropIndex}`;
            const value = 0;

            getHeaderNames(this.data, this.refKey).forEach(ref => {
                this.data.push({
                    [this.propKey]: prop,
                    [this.refKey]: ref,
                    [this.valueKey]: value
                });
            });

            this.trigger(EVENTS.updateData);
            this.render();
        },

        deleteProp(prop) {
            this.data = this.data.filter(item => item[this.propKey] !== prop);
            this.trigger(EVENTS.updateData);
            this.render();
        },

        render() {
            const content = `
                ${renderControls({
                    prop: this.propKey,
                    value: this.valueKey
                })}
                <div class="st-block--table st-chart__table">
                ${renderTable({
                    data: this.data,
                    colors: this.colors,
                    refKey: this.refKey,
                    propKey: this.propKey,
                    valueKey: this.valueKey
                })}
                </div>
            `;

            this.$elem.html(content);
        },

        updateCell({ ref, prop, newValue }) {
            this.data.forEach(item => {
                if (item[this.refKey] === ref && item[this.propKey] === prop) {
                    item[this.valueKey] = newValue;
                }
            });
        }
    }
};
