import { DEFAULT_TABLE, TABLE_PARAMS, CONTEXT_MENU } from './params';

import Handsontable from 'handsontable/dist/handsontable.full'; // Handsontable require and pikaday as a global var if we don't do that ¯\_(ツ)_/¯

import Headinger from './headinger';
import marked from './marked';

const CLASSES = {
    th: 'visualy-th',
    thead: 'visualy-thead',
    tfoot: 'visualy-tfoot'
};

/**
 * Renderer Handsontable
 * @param  {...Array[]}         args        Arguments from handsontable for renderer
 * @param  {Handsontable}       args[].hot  Handsontable instance
 * @param  {Dom}                args[].TD   Dom element modified
 * @param  {number}             args[].row
 * @param  {number}             args[].col
 * @param  {number}
 * @param  {string|null|number} args[].value
 * @return {Dom}
 */
function renderer(...args) {
    const [ hot, TD, row, col, , value ] = args;
    const maxRow = hot.countRows() - 1;

    Handsontable.renderers.TextRenderer(...args);
    TD.innerHTML = marked(value);

    if (row === 0) {
        TD.classList.toggle(CLASSES.thead, hot.headinger.theadActive);
    }
    else if (row === maxRow) {
        TD.classList.toggle(CLASSES.tfoot, hot.headinger.tfootActive);
    }

    const isTh = hot.headinger.thInfoCollection.getInfo(row, col) !== undefined;

    TD.classList.toggle(CLASSES.th, isTh);

    return TD;
}

/**
 * Callback contextMenu
 * @param  {string}   type   Event name
 */
function callback(type) {
    switch (type) {
        case 'switchTHEAD':
            this.headinger.toggleTHEAD();
            this.render();
            break;
        case 'switchTFOOT':
            this.headinger.toggleTFOOT();
            this.render();
            break;
        case 'switchTH':
            this.headinger.setOrUnsetTH(this.getSelectedRange());
            this.render();
            break;
    }
}

export function getHandsontable(context, data = DEFAULT_TABLE, mergeCells, thCells, thActive, tfootActive) {
    const contextMenu = Object.assign({}, CONTEXT_MENU, { callback });

    const params = Object.assign({}, TABLE_PARAMS, {
        init() {
            this.mergeCells.mergedCellInfoCollection.clear = function() { // handle a clear
                this.splice(0, this.length);
                return this;
            };
            this.headinger = new Headinger(thCells, thActive, tfootActive);
        },
        renderer,
        contextMenu,
        data,
        mergeCells
    });

    const handsontable = new Handsontable(context, params);

    handsontable.resetCells = function() {
        this.headinger.unsetTHEAD();
        this.headinger.unsetTFOOT();
        this.headinger.thInfoCollection.clear();
        this.mergeCells.mergedCellInfoCollection.clear();
    };

    setTimeout(() => handsontable.render(), 25);

    return handsontable;
}

export { DEFAULT_DATA } from './params';
