/*
    List Block
*/

import Block from '../block';
import stToHTML from '../to-html';

import ScribeListBlockPlugin from './scribe-plugins/scribe-list-block-plugin';

const CLASS_CONTAINER = 'st-block--list';
const SELECTOR_CONTAINER = `.${ CLASS_CONTAINER }`;

export default Block.extend({

    type: 'list',

    title: () => i18n.t('blocks:list:title'),

    editorHTML: `<ul class="${ CLASS_CONTAINER }"></ul>`,

    listItemEditorHTML: '<li class="st-block--list__item"><div class="st-block--list__editor st-block__editor"></div></li>',

    'icon_name': 'List',

    'multi_editable': true,

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

    setupContainer() {
        this.container = this.container || this.inner.querySelector(SELECTOR_CONTAINER);
    },

    loadData({ listItems = [], text = '', format = '' }) {
        this.setupContainer();

        const list = format === 'html' ? listItems : this.parseFromMarkdown(text);

        list.forEach(item => this.addListItem(item.content));
    },

    parseFromMarkdown(markdown) {
        return markdown
            .replace(/^ - (.+)$/mg, '$1').split('\n')
            .filter(item => item.length)
            .map(item => ({ content: stToHTML(item, this.type) }));
    },

    onBlockRender() {
        this.setupContainer();
        if (this.editorIds.length < 1) { this.addListItem(); }
    },

    _serializeData() {
        return {
            listItems: this.editorIds.map(editorId => {
                const content = this.getTextEditor(editorId).scribe.getContent();
                return { content };
            })
        };
    },

    // List Items manipulation functions (add, remove, etc)
    addListItemAfterCurrent(content) {
        this.addListItem(content, this.getCurrentTextEditor());
    },

    addListItem(content = '', after) {
        const text = content.trim() !== '<br>' ? content.trim() : '';

        const editor = this.newTextEditor(this.listItemEditorHTML, text);

        if (after && this.container.lastchild !== after.node) {
            const before = after.node.nextSibling;
            this.container.insertBefore(editor.node, before);

            const idx = this.editorIds.indexOf(after.id) + 1;
            this.editorIds.splice(idx, 0, editor.id);
        }
        else {
            this.container.appendChild(editor.node);
            this.editorIds.push(editor.id);
        }

        if (!text) {
            this.focusOn(editor);
        }
    },

    focusOnNeighbor() {
        const neighbor = this.previousListItem() || this.nextListItem();

        if (neighbor) {
            this.focusOn(neighbor);
        }
    },

    focusOn(editor) {
        const scribe = editor.scribe;
        const selection = new scribe.api.Selection();
        const lastChild = scribe.el.lastChild;
        const range = selection.range ? selection.range.cloneRange() : false;

        editor.el.focus();

        if (range) {
            range.setStartAfter(lastChild, 1);
            range.collapse(false);
        }
    },

    focusAtEnd() {
        const lastEditorId = this.editorIds[this.editorIds.length - 1];
        this.appendToTextEditor(lastEditorId);
    },

    removeCurrentListItem() {
        if (this.editorIds.length === 1) { return; }

        const item = this.getCurrentTextEditor();
        const idx = this.editorIds.indexOf(item.id);

        this.focusOnNeighbor(item);
        this.editorIds.splice(idx, 1);
        this.container.removeChild(item.node);
        this.removeTextEditor(item.id);
    },

    appendToCurrentItem(content) {
        this.appendToTextEditor(this.getCurrentTextEditor().id, content);
    },

    isLastListItem() {
        return this.editorIds.length === 1;
    },

    nextListItem() {
        const idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
        const editorId = this.editorIds[idx + 1];

        if (editorId !== undefined) {
            return this.getTextEditor(editorId);
        }

        return null;
    },

    previousListItem() {
        const idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
        const editorId = this.editorIds[idx - 1];

        if (editorId !== undefined) {
            return this.getTextEditor(editorId);
        }

        return null;
    }

});
