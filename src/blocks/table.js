/*
    Table Block
*/

import Handsontable from 'handsontable/dist/handsontable.full'; // Handsontable require and pikaday as a global var if we don't do that ¯\_(ツ)_/¯
import Marked from 'marked';
import Block from '../block';
import utils from '../utils';

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

const MRenderer = new Marked.Renderer();
MRenderer.paragraph = text => text; // override paragraph
MRenderer.link = (href, title, text) => `<a href="${ href }" ${ title ? `title="${ title }"` : '' } target="_blank">${ text }</a>`;

const MARKED_OPTS = {
    renderer: MRenderer,
    gfm: true,
    tables: false,
    smartLists: false
};

Marked.setOptions(MARKED_OPTS);

const TABLE = [
    [ null, 'Header 1', 'Header 2' ],
    [ 'Row 1', 'Data 1:1', 'Data 2:1' ],
    [ 'Row 2', 'Data 1:2', 'Data 2:2' ]
];

const MERGE_CELLS = [];

const DEFAULT_DATA = {
    type: 'object',
    table: TABLE,
    mergeCells: MERGE_CELLS
};

const TABLE_PARAMS = {
    stretchH: 'all',
    mergeCells: MERGE_CELLS,
    renderer(...args) {
        const [ , td, , , , value ] = args;
        Handsontable.renderers.TextRenderer(...args); // this => block.handsontable

        td.innerHTML = Marked.parser(Lexer.lex(value || ''));

        return td;
    },
    contextMenu: {
        items: {
            'row_above': {
                name: i18n.t('blocks:table:rowAbove')
            },
            'row_below': {
                name: i18n.t('blocks:table:rowBelow')
            },
            'col_left': {
                name: i18n.t('blocks:table:colLeft')
            },
            'col_right': {
                name: i18n.t('blocks:table:colRight')
            },
            hsep1: '---------',
            'remove_row': {
                name: i18n.t('blocks:table:removeRow')
            },
            'remove_col': {
                name: i18n.t('blocks:table:removeCol')
            },
            hsep2: '---------',
            /* Do weard things with Marked * /
            'undo': {
                name: i18n.t('blocks:table:undo')
            },
            'redo': {
                name: i18n.t('blocks:table:redo')
            },
            /* */
            hsep3: '---------',
            mergeCells: {
                // name: i18n.t('blocks:table:mergeCells'), // we can't change the name for the unmerge
                disabled() {
                    const [ row1, col1, row2, col2 ] = this.getSelected();
                    return row1 === row2 && col1 === col2;
                }
            }
        }
    }
};

export default Block.extend({

    type: 'table',

    title: () => i18n.t('blocks:table:title'),

    editorHTML: '<div class="st-block--handsontable"><div class="handsontable-container"></div></div>',

    'icon_name': 'table',

    textable: false,

    toolbarEnabled: true,

    formatBarEnabled: false,

    _serializeData() {
        utils.log(`toData for ${this.blockID}`);

        if (this.handsontable) {
            const table = this.handsontable.getData();
            const mergeCells = this.handsontable.mergeCells.mergedCellInfoCollection.map(m => m);

            return { table, mergeCells };
        }

        return DEFAULT_DATA;
    },

    loadData({ table, mergeCells }) {
        this.setHandsontable(table, mergeCells);
    },

    onBlockRender() {
        const { data: { table, mergeCells } } = this.getData();
        this.setHandsontable(table, mergeCells);
    },

    setHandsontable(data = TABLE, mergeCells = MERGE_CELLS) {
        if (!this.handsontable) {
            this.handsontable = new Handsontable(
                this.$('.handsontable-container')[0],
                Object.assign({}, TABLE_PARAMS, {
                    data,
                    mergeCells,

                    afterChange: (changes, type) => {
                        if (type === 'loadData') {
                            //this.$('.st-block--handsontable')[0].classList.add('is-ready');
                        }
                    }
                })
            );

            setTimeout(() => {
                this.handsontable.render();
            }, 25);
        }
    }

});
