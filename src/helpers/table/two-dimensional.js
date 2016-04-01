import $                  from 'etudiant-mod-dom';
import * as _             from '../../lodash.js';
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
import { getHeaderNames } from './lib.js';

const AXIS = {
    'x-axis': 'rowKey',
    'y-axis': 'valueKey'
};

function renderControls({ xAxis, yAxis }) {
    return `<div>
                <div>
                    <label>${i18n.t('blocks:table2D:axisX')}</label>
                    <input type="text" data-cell-type="axis" data-axis-type="x-axis" value="${xAxis}" data-old-value="${xAxis}" />
                    <label>${i18n.t('blocks:table2D:axisY')}</label>
                    <input type="text" data-cell-type="axis" data-axis-type="y-axis" value="${yAxis}" data-old-value="${yAxis}" />
                </div>
            </div>`;
}


function renderTable(tableData) {
    const headerData = tableData.shift();
    const headerCount = headerData.length;
    const headerLastIndex = headerCount - 1;
    const rowsCount = tableData.length;

    const thead = renderTHEAD(
        renderTR(
            headerData.reduce((markup, item, index) => `
                ${markup}
                ${renderTH(renderINPUT({ value: item, type: 'column-header' }))}
                ${index === headerLastIndex ? renderTH(`<button type="button" data-action="add-column">${i18n.t('blocks:table1D:addColumn')}</button>`) : ''}
            `,
            renderTH(''))
        )
    );

    const trows = tableData.map(rowData => {
        const rowName = rowData.shift();
        const colLastIndex = rowData.length - 1;

        return renderTR(
            rowData.reduce((markup, item, index) => `
                ${markup}
                ${renderTD(renderINPUT({ value: item.value, type: 'standard', coord: item.coord }))}
                ${rowsCount > 1 && index === colLastIndex ? renderTD(renderDELETE({ key: rowName, text: i18n.t('blocks:table1D:delete'), type: 'row' })) : ''}
            `,
            renderTD(renderINPUT({ value: rowName, type: 'row-header' }))
            )
        );
    })
    .reduce((prev, curr) => `${prev}${curr}`);


    const tbody = renderTBODY(trows);

    const tfoot = renderTFOOT(renderTR(
        headerData.reduce((markup, item, index) => `
            ${markup}
            ${renderTD(headerCount > 1 ? renderDELETE({ key: item, text: 'supprimer', type: 'column' }) : '')}
            ${index === headerLastIndex ? renderTD('') : ''}
        `,
        renderTD(`<button type="button" data-action="add-row">${i18n.t('blocks:table1D:addRow')}</button>`))
    ));

    return renderTABLE(`
        ${thead}
        ${tbody}
        ${tfoot}
    `);
}

function getValue({ data, rowKey, rowName, columnKey, columnName, valueKey }) {
    const result = data.filter(item => item[rowKey] === rowName && item[columnKey] === columnName).shift();

    return result[valueKey];
}

function prepareData({ data, columnNames, rowNames, rowKey, columnKey, valueKey }) {
    const prepared = rowNames.map(rowName => {
        const preparedRow = columnNames.map(columnName => ({
            coord: `${rowName}$${columnName}`,
            value: getValue({ data, rowKey, rowName, columnKey, columnName, valueKey })
        }));

        preparedRow.unshift(rowName);

        return preparedRow;
    });

    prepared.unshift(columnNames);

    return prepared;
}

export default {
    addColumn() {
        if (!this.newColumnIndex) {
            this.newColumnIndex = getHeaderNames(this.tableData, this.columnKey).length;
        }
        this.newColumnIndex++;

        const newColumn = getHeaderNames(this.tableData, this.rowKey).map(name => {
            const newItem = {};

            newItem[this.valueKey] = 0;
            newItem[this.rowKey] = name;
            newItem[this.columnKey] = `${i18n.t('blocks:table2D:newColumn')} ${this.newColumnIndex}`;

            return newItem;
        });

        this.tableData = [].concat(this.tableData, newColumn);

        this.trigger('update', this.tableData);
        this.render();
    },

    addRow() {
        if (!this.newRowIndex) {
            this.newRowIndex = getHeaderNames(this.tableData, this.rowKey).length;
        }
        this.newRowIndex++;

        const newRow = getHeaderNames(this.tableData, this.columnKey).map(name => {
            const newItem = {};

            newItem[this.valueKey] = 0;
            newItem[this.columnKey] = name;
            newItem[this.rowKey] = `${i18n.t('blocks:table2D:newRow')} ${this.newRowIndex}`;

            return newItem;
        });

        this.tableData = [].concat(this.tableData, newRow);

        this.trigger('update', this.tableData);
        this.render();
    },

    deleteColumn(columnName) {
        this.tableData = this.tableData.filter(item => item[this.columnKey] !== columnName);
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

        this.$elem.append(renderControls({
            xAxis: this.rowKey,
            yAxis: this.valueKey
        }));

        const preparedData = prepareData({
            data: this.tableData,
            columnNames: getHeaderNames(this.tableData, this.columnKey),
            rowNames: getHeaderNames(this.tableData, this.rowKey),
            columnKey: this.columnKey,
            rowKey: this.rowKey,
            valueKey: this.valueKey
        });

        this.$elem.append(renderTable(preparedData));
    },

    registerKeyUpListeners() {
        if (this.hasRegisteredKeyUp) {
            return false;
        }

        this.hasRegisteredKeyUp = true;

        this.$elem.on('keyup', _.debounce(e => {
            const $srcElement = $(e.originalEvent.srcElement);

            const newValue = $srcElement.val().toString();
            const oldValue = $srcElement.data('oldValue').toString();

            switch ($srcElement.data('cellType')) {
                case 'row-header':
                    this.updateHeader({
                        key: this.rowKey,
                        newValue,
                        oldValue
                    });
                    break;
                case 'column-header':
                    this.updateHeader({
                        key: this.columnKey,
                        newValue,
                        oldValue
                    });
                    break;
                case 'axis':
                    this.updateDataKey({
                        type: AXIS[$srcElement.data('axisType')],
                        newKey: newValue,
                        oldKey: oldValue
                    });
                    break;
                default:
                    const [ row, column ] = $srcElement.data('coord').split('$');
                    this.updateCell({
                        newValue: parseInt(newValue),
                        row,
                        column
                    });
            }
        }, 400));
    },

    updateCell({ newValue, column, row }) {
        if (newValue === '') {
            this.trigger('error', 'empty');
            this.render();
        }
        else if (isNaN(newValue)) {
            this.trigger('error', 'number');
            this.render();
        }
        else {
            this.tableData.forEach(item => {
                if (item[this.rowKey] === row && item[this.columnKey] === column) {
                    item[this.valueKey] = newValue;
                }
            });

            this.trigger('update', this.tableData);
        }
    }
};
