/*
    List Block
*/

import Block from '../block';
import stToHTML from '../to-html';

import ScribeListBlockPlugin from './scribe-plugins/scribe-list-block-plugin';

export default Block.extend({

    type: 'list',

    title: () => i18n.t('blocks:list:title'),

    editorHTML: '<ul class="st-block--list__list"></ul>',

    listItemEditorHTML: '<li class="st-block--list__item"><div class="st-block--list__editor st-block__editor"></div></li>',

    icon_name: 'List',

    multi_editable: true,

    scribeOptions: {
        allowBlockElements: false,
        tags: {
            p: false
        }
    },

    configureScribe(scribe) {
        scribe.use(new ScribeListBlockPlugin(this));
    },

    initialize() {
        this.editorIds = [];
    },

    // Data functions (loading, converting, saving)
    beforeLoadingData() {
        this.setupListVariables();

        this.loadData(this._getData());
    },

    onBlockRender() {
        if (!this.ul) { this.setupListVariables(); }
        if (this.editorIds.length < 1) { this.addListItem(); }
    },

    setupListVariables() {
        this.ul = this.inner.querySelector('ul');
    },

    loadData(data) {
        var block = this;
        if (this.options.convertFromMarkdown && data.format !== 'html') {
            data = this.parseFromMarkdown(data.text);
        }

        if (data.listItems.length) {
            data.listItems.forEach(function(li) {
                block.addListItem(li.content);
            });
        }
        else {
            block.addListItem();
        }
    },

    parseFromMarkdown(markdown) {
        var listItems = markdown.replace(/^ - (.+)$/mg, '$1').split('\n');
        listItems = listItems.
            filter(function(item) {
                return item.length;
            }).
            map(function(item) {
                return { content: stToHTML(item, this.type) };
            }.bind(this));

        return { listItems: listItems, format: 'html' };
    },

    _serializeData() {
        var data = { format: 'html', listItems: [] };

        this.editorIds.forEach(function(editorId) {
            var listItem = { content: this.getTextEditor(editorId).scribe.getContent() };
            data.listItems.push(listItem);
        }.bind(this));

        return data;
    },

    // List Items manipulation functions (add, remove, etc)
    addListItemAfterCurrent(content) {
        this.addListItem(content, this.getCurrentTextEditor());
    },

    addListItem(content, after) {
        content = content || '';
        if (content.trim() === '<br>') { content = ''; }

        var editor = this.newTextEditor(this.listItemEditorHTML, content);

        if (after && this.ul.lastchild !== after.node) {
            var before = after.node.nextSibling;
            this.ul.insertBefore(editor.node, before);

            var idx = this.editorIds.indexOf(after.id) + 1;
            this.editorIds.splice(idx, 0, editor.id);
        }
        else {
            this.ul.appendChild(editor.node);
            this.editorIds.push(editor.id);
        }

        !content && this.focusOn(editor); // jshint ignore:line
    },

    focusOnNeighbor() {
        var neighbor = this.previousListItem() || this.nextListItem();

        if (neighbor) {
            this.focusOn(neighbor);
        }
    },

    focusOn(editor) {
        var scribe = editor.scribe;
        var selection = new scribe.api.Selection();
        var lastChild = scribe.el.lastChild;
        var range;
        if (selection.range) {
            range = selection.range.cloneRange();
        }

        editor.el.focus();

        if (range) {
            range.setStartAfter(lastChild, 1);
            range.collapse(false);
        }
    },

    focusAtEnd() {
        var lastEditorId = this.editorIds[this.editorIds.length - 1];
        this.appendToTextEditor(lastEditorId);
    },

    removeCurrentListItem() {
        if (this.editorIds.length === 1) { return; }

        var item = this.getCurrentTextEditor();
        var idx = this.editorIds.indexOf(item.id);

        this.focusOnNeighbor(item);
        this.editorIds.splice(idx, 1);
        this.ul.removeChild(item.node);
        this.removeTextEditor(item.id);
    },

    appendToCurrentItem(content) {
        this.appendToTextEditor(this.getCurrentTextEditor().id, content);
    },

    isLastListItem() {
        return this.editorIds.length === 1;
    },

    nextListItem() {
        var idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
        var editorId = this.editorIds[idx + 1];

        if (editorId !== undefined) {
            return this.getTextEditor(editorId);
        }
        else {
            return null;
        }
    },

    previousListItem() {
        var idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
        var editorId = this.editorIds[idx - 1];

        if (editorId !== undefined) {
            return this.getTextEditor(editorId);
        }
        else {
            return null;
        }
    }

});
