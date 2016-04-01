import $ from 'etudiant-mod-dom';
import * as _ from '../../lodash.js';
import {
    renderDELETE,
    renderINPUT,
    renderTABLE,
    renderTHEAD,
    renderTBODY,
    renderTFOOT,
    renderTR,
    renderTH,
    renderTD
} from './render.js';
import { getHeaderNames as getHeaderNames } from './lib.js';

function renderTable(tableData) {
    const headerData = tableData.shift();
    const rowsCount = tableData.length;

    const thead = renderTHEAD(
        renderTR(`
            ${renderTH('')}
            ${renderTH(renderINPUT({ value: headerData[0], type: 'column-header' }))}
        `)
    );

    const trows = tableData.map(([ name, data ], index) => renderTR(
            `${renderTD(renderINPUT({ value: name, type: 'row-header' }))}
            ${renderTD(renderINPUT({ value: data.value, type: 'standard', coord: data.coord }))}
            ${renderTD(rowsCount > 1 ? renderDELETE({ key: name, text: i18n.t('blocks:table1D:delete'), type: 'row' }) : '')}`
        )
    )
    .reduce((prev, curr) => `${prev}${curr}`);

    const tbody = renderTBODY(trows);

    const tfoot = renderTFOOT(
        renderTR(renderTD(`<button type="button" data-action="add-row">${i18n.t('blocks:table1D:addRow')}</button>`))
    );

    return renderTABLE(`
        ${thead}
        ${tbody}
        ${tfoot}
    `);
}

function prepareData({ rowNames, valueKey, data }) {
    var prepared = rowNames.map(function(rowName, index) {
        return [
            rowName,
            {
                coord: `${rowName}$${valueKey}`,
                value: data[index][valueKey]
            }
        ];
    });

    prepared.unshift([ valueKey ]);

    return prepared;
}

export default {
    addRow() {
        const newRow = {};
        this.newRowIndex = this.newRowIndex || this.tableData.length;

        newRow[this.valueKey] = 0;
        newRow[this.rowKey] = `${i18n.t('blocks:table1D:newRow')} ${++this.newRowIndex}`;

        this.tableData.push(newRow);

        this.trigger('update', this.tableData);
        this.render();
    },

    deleteRow(rowName) {
        this.tableData = this.tableData.filter(item => item[this.rowKey] !== rowName);
        this.trigger('update', this.tableData);
        this.render();
    },

    render() {
        this.$elem.empty();

        const data = prepareData({
            data: this.tableData,
            rowNames: getHeaderNames(this.tableData, this.rowKey),
            valueKey: this.valueKey
        });

        this.$elem.append(renderTable(data));
    },

    registerKeyUpListeners() {
        if (this.hasRegisteredKeyUp) {
            return false;
        }

        this.hasRegisteredKeyUp = true;

        this.$elem.on('keyup', _.debounce(e => {
            const $srcElement = $(e.originalEvent.srcElement);

            const cellType = $srcElement.data('cellType');

            if (cellType === 'row-header') {
                this.updateHeader({
                    key: this.rowKey,
                    newValue: $srcElement.val().toString(),
                    oldValue: $srcElement.data('oldValue').toString()
                });
            }
            else if (cellType === 'column-header') {
                this.updateDataKey({
                    type: 'valueKey',
                    newKey: $srcElement.val(),
                    oldKey: $srcElement.data('oldValue').toString()
                });
            }
            else {
                this.updateCell({
                    newValue: parseInt($srcElement.val()),
                    row: $srcElement.data('coord').split('$')[0].toString(),
                    column: $srcElement.data('coord').split('$')[1].toString()
                });
            }
        }, 400));
    },

    updateCell(params) {
        if (params.newValue === '') {
            this.trigger('error', 'empty');
            this.render();
        }
        else if (isNaN(params.newValue)) {
            this.trigger('error', 'number');
            this.render();
        }
        else {
            this.tableData = this.tableData.map(item => {
                if (item[this.rowKey] === params.row) {
                    item[this.valueKey] = params.newValue;
                }

                return item;
            });

            this.trigger('update', this.tableData);
        }
    }
};
