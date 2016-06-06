export const DEFAULT_TABLE = [
    [ '', 'Header 1', 'Header 2' ],
    [ 'Row 1', 'Data 1:1', 'Data 2:1' ],
    [ 'Row 2', 'Data 1:2', 'Data 2:2' ]
];

export const DEFAULT_MERGE = [];

export const DEFAULT_DATA = {
    type: 'object',
    table: DEFAULT_TABLE,
    mergeCells: DEFAULT_MERGE
};

export const CONTEXT_MENU = {
    items: {
        'row_above': {
            name: i18n.t('blocks:table:rowAbove')
        },

        'row_below': {
            name: i18n.t('blocks:table:rowBelow')
        },

        hsep0: '---------',

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

        switchTHEAD: {
            name() {
                return this.headinger.theadActive ? i18n.t('blocks:table:unsetTHEAD') : i18n.t('blocks:table:setTHEAD');
            }
        },

        switchTH: {
            name() {
                const [ row, col ] = this.getSelected();
                const info = this.headinger.thInfoCollection.getInfo(row, col);
                return info ? i18n.t('blocks:table:unsetTH') : i18n.t('blocks:table:setTH');
            },
            disabled() {
                const range = this.getSelectedRange();
                return !this.headinger.canBeTH(range);
            }
        },

        switchTFOOT: {
            name() {
                return this.headinger.tfootActive ? i18n.t('blocks:table:unsetTFOOT') : i18n.t('blocks:table:setTFOOT');
            }
        },

        hsep3: '---------',

        mergeCells: {
            name() {
                const [ row, col ] = this.getSelected();
                const info = this.mergeCells.mergedCellInfoCollection.getInfo(row, col);
                return info ? i18n.t('blocks:table:splitCells'): i18n.t('blocks:table:mergeCells');
            },
            disabled() {
                const range = this.getSelectedRange();
                return !this.mergeCells.canMergeRange(range);
            }
        }

        /* Do weard things with Marked * /
        'undo': {
            name: i18n.t('blocks:table:undo')
        },

        'redo': {
            name: i18n.t('blocks:table:redo')
        },
        /* */
    }
};

export const TABLE_PARAMS = {
    stretchH: 'all'
};
