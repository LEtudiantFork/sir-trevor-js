/*
    Encard Block
*/

import Block from '../block';
import utils from '../utils';

import ScribeListBlockPlugin from './scribe-plugins/scribe-list-block-plugin';

const CLASS_CONTAINER = 'st-block--encard';
const SELECTOR_CONTAINER = `.${ CLASS_CONTAINER }`;

const DEFAULT_THEME = {
    ref: 'default',
    label: 'Default'
};

export default Block.extend({

    type: 'encard',

    themeClass: `${ CLASS_CONTAINER }--${ DEFAULT_THEME.ref }`,

    title: () => i18n.t('blocks:encard:title'),

    editorHTML: `<div class="${ CLASS_CONTAINER } ${ CLASS_CONTAINER }--${ DEFAULT_THEME.ref }"></div>`,

    listItemEditorHTML: '<p class="st-block--encard__item st-block__editor"></p>',

    'icon_name': 'Encarded',

    controllable: true,

    textable: false,

    toolbarEnabled: true,

    formatBarEnabled: false,

    'multi_editable': true,

    controls() {
        this.themes = this.globalConfig.themesEncard || [ DEFAULT_THEME ];

        const controls = this.themes.map(theme => {
            return {
                event: 'click',
                html: `<button type="button" data-theme="${ theme.ref }" class="st-control-block st-btn">${ theme.label }</button>`,
                cb(e) {
                    const themeRef = e.target.dataset.theme;
                    this.setTheme(themeRef);
                    this.setData({ theme: themeRef });
                }
            };
        });

        return Object.assign.call({}, controls);
    },

    configureScribe(scribe) {
        scribe.use(new ScribeListBlockPlugin(this));
    },

    scribeOptions: {
        allowBlockElements: false
    },

    initialize() {
        this.editorIds = [];
    },

    setupContainer() {
        this.container = this.container || this.inner.querySelector(SELECTOR_CONTAINER);
    },

    loadData({ theme = this.getFirstTheme(), listItems = [] }) {
        this.setupContainer();
        this.setTheme(theme);
        listItems.forEach(item => this.addListItem(item.content));
    },

    onBlockRender() {
        if (this.editorIds.length < 1) {
            this.setupContainer();
            this.setTheme(this.getFirstTheme());
            this.addListItem();
        }
    },

    getFirstTheme() {
        const [ { ref: theme } ] = this.themes;
        return theme;
    },

    setTheme(themeRef) {
        const { style } = this.themes.find(theme => theme.ref === themeRef) || {};
        if (style) {
            this.container.style = style;
        }

        this.container.classList.remove(this.themeClass);
        this.themeClass = `${ CLASS_CONTAINER }--${ themeRef }`;
        this.container.classList.add(this.themeClass);
    },

    _serializeData() {
        utils.log(`toData for %c${this.blockID}`, utils.logBold);

        var data = {
            listItems: this.editorIds.map(editorId => {
                const content = this.getTextEditor(editorId).scribe.getContent();
                return { content };
            })
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

        return data;
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
        const range = selection.range ? selection.range.cloneRange() : false;

        editor.el.focus();

        if (range) {
            range.setStartAfter(scribe.el.lastChild, 1);
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
