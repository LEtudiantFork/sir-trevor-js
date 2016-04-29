/*
    Table Block
*/

import Handsontable from 'handsontable/dist/handsontable.full'; // Handsontable require and pikaday as a global var if we don't do that ¯\_(ツ)_/¯
import Block from '../block';
import utils from '../utils';
import { chunk as _chunk } from '../lodash';

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
            'undo': {
                name: i18n.t('blocks:table:undo')
            },
            'redo': {
                name: i18n.t('blocks:table:redo')
            },
            hsep3: '---------',
            'mergeCells': {
                // name: i18n.t('blocks:table:mergeCells'), // we can't change the name for the unmerge
                disabled: function() { // we need the scope
                    let [ p1, p2 ] = _chunk(this.getSelected(), 2);
                    return p1.length === p2.length && p1.every((v, i) => v === p2[i]);
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
                Object.assign({}, TABLE_PARAMS, { data, mergeCells })
            );

            setTimeout(() => {
                this.handsontable.render();
            }, 25);
        }
    }

});
