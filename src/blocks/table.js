/*
    Table Block
*/

// import Handsontable from 'handsontable';
import Block from '../block';

// const ScribeTableBlockPlugin = require('./scribe-plugins/scribe-table-plugin');
// const ScribeTextBlockPlugin = require('./scribe-plugins/scribe-text-block-plugin');

const tableContent = `<table>
    <thead>
        <tr>
            <th>Header1</th>
            <th>Header2</th>
            <th>Header3</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>value1</td>
            <td>value2</td>
            <td>value3</td>
        </tr>
    </tbody>
</table>`;

export default Block.extend({

    type: 'table',

    title: () => i18n.t('blocks:table:title'),

    editorHTML: '<div class="st-required st-block--table"></div>',

    icon_name: 'table',

    textable: false,

    toolbarEnabled: true,

    formatBarEnabled: false,

    loadData(data) {
        if (data && data.format === 'html') {
            this.$('.st-block--table')[0].innerHTML = data.text;
            // this.setTextBlockHTML(data.text);
        }
    },
/*
    configureScribe(scribe) {
        scribe.use(new ScribeTableBlockPlugin(this));
        scribe.use(new ScribeTextBlockPlugin(this));
    },

    scribeOptions: {
        allowBlockElements: false,
        tags: {
            table: true,
            thead: true,
            tbody: true,
            tfoot: true,
            tr: true,
            th: true,
            td: true,
            p: false,
            br: false
        }
    },
*/
    onBlockRender() {
        if (this.isEmpty()) {
            this.$('.st-block--table')[0].innerHTML = tableContent;
        }
    }
});
