'use strict';

const Block = require('../block');

const ScribeTableBlockPlugin = require('./scribe-plugins/scribe-table-plugin');
const ScribeTextBlockPlugin = require('./scribe-plugins/scribe-text-block-plugin');

const tableContent = '<table><tbody><tr><td>Header1</td><td>Header2</td><td>Header3</td></tr><tr><td>value1</td><td>value2</td><td>value3</td></tr></tbody></table>';

module.exports = Block.extend({

    type: 'table',
    title: function() { return i18n.t('blocks:table:title'); },

    editorHTML: '<div class="st-required st-text-block st-block--table" contenteditable="true"></div>',

    icon_name: 'table',

    toolbarEnabled: true,
    formatBarEnabled: false,
    textable: false,

    loadData: function(data){
        if (data && data.format === 'html') {
            this.setTextBlockHTML(data.text);
        }
    },

    configureScribe: function(scribe) {
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

    onBlockRender: function() {
        if (this._scribe.getContent() === '') {
            this._scribe.setContent(tableContent);
        }
    }
});
