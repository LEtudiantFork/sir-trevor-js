import { DEFAULT_TABLE, TABLE_PARAMS, MARKED_PARAMS, CONTEXT_MENU } from './params';

import Handsontable from 'handsontable/dist/handsontable.full'; // Handsontable require and pikaday as a global var if we don't do that ¯\_(ツ)_/¯
import Marked from 'marked';

import Headinger from './headinger';
import Xls from './xls';

const CLASSES = {
    th: 'visualy-th',
    thead: 'visualy-thead',
    tfoot: 'visualy-tfoot'
};

function noop() {}
noop.exec = noop;

/**
 * Bypass Lexer's rules for Marked, that way markdown specific block are avoided
 * @type {Marked}
 */
const Lexer = new Marked.Lexer({});
Lexer.rules.blockquote = noop;
Lexer.rules.code = noop;
Lexer.rules.heading = noop;
Lexer.rules.hr = noop;
Lexer.rules.list = noop;

/**
 * Bypass Lexer's renderer for Marked, that way no balise p are injected
 * @type {Marked}
 */
const markedRenderer = new Marked.Renderer();
markedRenderer.paragraph = text => text; // override paragraph
markedRenderer.link = (href, title, text) => `<a href="${ href }" ${ title ? `title="${ title }"` : '' } target="_blank">${ text }</a>`;

const MARKED_OPTS = Object.assign({}, MARKED_PARAMS, { renderer: markedRenderer });

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
    TD.innerHTML = Marked.parser(Lexer.lex(value || ''), MARKED_OPTS);

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

function loadData(hot, data) {
    hot.resetCells();
    hot.loadData(data);
    hot.render();
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
            this.xlsImport = Xls.create();
            this.xlsImport.on('import:xsl', data => loadData(this, data));
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
