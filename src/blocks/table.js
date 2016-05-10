/*
    Table Block
*/

import Block from '../block';
import utils from '../utils';

import { DEFAULT_DATA, getHandsontable } from './handsontable';

const editorHTML = `
    <div class="st-block--handsontable">
        <div class="handsontable-container"></div>
        <div class="st-helper">
            <span>${ i18n.t('help:format') } : </span>
            <code>**<b>bold</b>**</code>
            <code>_<i>italic</i>_</code>
            <code>[link](http://www.google.com)</code>
        </div>
    </div>
`;

export default Block.extend({

    type: 'table',

    title: () => i18n.t('blocks:table:title'),

    editorHTML,

    'icon_name': 'table',

    textable: false,

    toolbarEnabled: true,

    formatBarEnabled: false,

    _serializeData() {
        utils.log(`toData for ${this.blockID}`);

        if (this.handsontable) {
            const table = this.handsontable.getData();
            const mergeCells = this.handsontable.mergeCells.mergedCellInfoCollection;
            const thCells = this.handsontable.headinger.thInfoCollection;
            const theadActive = this.handsontable.headinger.theadActive;
            const tfootActive = this.handsontable.headinger.tfootActive;

            return { table, mergeCells, thCells, theadActive, tfootActive };
        }

        return DEFAULT_DATA;
    },

    loadData({ table, mergeCells, thCells, theadActive, tfootActive }) {
        this.setHandsontable(table, mergeCells, thCells, theadActive, tfootActive);
    },

    onBlockRender() {
        const { data: { table, mergeCells, thCells, theadActive, tfootActive } } = this.getData();
        this.setHandsontable(table, mergeCells, thCells, theadActive, tfootActive);
    },

    setHandsontable(table, mergeCells, thCells, theadActive, tfootActive) {
        if (!this.handsontable) {
            this.handsontable = getHandsontable(this.$('.handsontable-container')[0], table, mergeCells, thCells, theadActive, tfootActive);

            setTimeout(() => this.handsontable.render(), 25);
        }
    }

});
