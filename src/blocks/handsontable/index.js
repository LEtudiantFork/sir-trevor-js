import { DEFAULT_TABLE, TABLE_PARAMS, MARKED_PARAMS, CONTEXT_MENU } from './params';

import Handsontable from 'handsontable/dist/handsontable.full'; // Handsontable require and pikaday as a global var if we don't do that ¯\_(ツ)_/¯
import Marked from 'marked';

import Headinger from './headinger';

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

const markedRenderer = new Marked.Renderer();
markedRenderer.paragraph = text => text; // override paragraph
markedRenderer.link = (href, title, text) => `<a href="${ href }" ${ title ? `title="${ title }"` : '' } target="_blank">${ text }</a>`;

const MARKED_OPTS = Object.assign({}, MARKED_PARAMS, { renderer: markedRenderer });

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
        contextMenu,
        renderer,
        data,
        mergeCells
    });

    const handsontable = new Handsontable(context, params);

    handsontable.headinger = new Headinger(thCells, thActive, tfootActive);

    return handsontable;
}

export { DEFAULT_DATA } from './params';
