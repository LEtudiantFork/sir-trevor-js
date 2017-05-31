/*
    Table Block
*/

import Block from '../block';
import utils from '../utils';

import Xls from './handsontable/xls.class';

import { DEFAULT_DATA, getHandsontable } from './handsontable';

const editorHTML = `
    <div class="st-block--handsontable">
        <div class="st-actions">
            <button type="button" class="import-xls st-btn">${ i18n.t('blocks:table:importXLS') }</button>
        </div>
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

    countable: false,

    _serializeData() {
        utils.log(`toData for %c${this.blockID}`, utils.logBold);

        var data = DEFAULT_DATA;

        if (this.handsontable) {
            const table = this.handsontable.getData();
            const mergeCells = this.handsontable.mergeCells.mergedCellInfoCollection;
            const thCells = this.handsontable.headinger.thInfoCollection;
            const theadActive = this.handsontable.headinger.theadActive;
            const tfootActive = this.handsontable.headinger.tfootActive;

            data = { table, mergeCells, thCells, theadActive, tfootActive };
        }

        // Add any inputs to the data attr
        var matcher = [
          'input:not(.st-paste-block):not(.st-control-block)',
          'textarea:not(.st-paste-block)',
          'select:not(.st-paste-block)',
          'button:not(.st-paste-block):not(.st-control-block)'
        ].join(",");
        if (this.$(matcher).length > 0) {
          Array.prototype.forEach.call(this.$(matcher), function(input) {
            if (input.getAttribute('name')) {
              data[input.getAttribute('name')] = input.value;
            }
          });
        }

        var keys = Object.keys(data);
        if (_.isEmpty(data) || (keys[0] === 'anchor' && keys.length === 1)) {
            data = {};
        }

        return data;
    },

    loadData({ table, mergeCells, thCells, theadActive, tfootActive }) {
        this.setHandsontable(table, mergeCells, thCells, theadActive, tfootActive);
    },

    onBlockRender() {
        const { data: { table, mergeCells, thCells, theadActive, tfootActive } } = this.getData();
        this.setHandsontable(table, mergeCells, thCells, theadActive, tfootActive);
    },

    setHandsontable(table, mergeCells, thCells, theadActive, tfootActive) {
        if (this.handsontable) {
            return;
        }

        this.handsontable = getHandsontable(this.$('.handsontable-container')[0], table, mergeCells, thCells, theadActive, tfootActive);

        this.xlsImport = Xls.create();
        this.xlsImport.on('import:xsl', data => {
            this.handsontable.resetCells();
            this.handsontable.loadData(data);
            this.handsontable.render();
        });

        this.$('button.import-xls')[0].addEventListener('click', () => this.xlsImport.open());

        this.mediator.on('block:remove', blockID => {
            if (this.blockID === blockID) {
                this.handsontable.destroy();
                this.handsontable = null;
                this.xlsImport.destroy();
                this.xlsImport = null;
            }
        });
    }

});
