/*
    Heading Block
*/

import Block from '../block';

import scribeBuild from '../scribe.build';
import ScribeTextBlockPlugin from './scribe-plugins/scribe-text-block-plugin';

export default Block.extend({

    type: 'heading',

    title: () => i18n.t('blocks:heading:title'),

    editorHTML: '<div class="st-required st-text-block st-text-block--heading" contenteditable="true"></div>',

    'icon_name': 'Header',

    controllable: true,

    textable: false,

    toolbarEnabled: true,

    formatBarEnabled: false,

    configureScribe(scribe) {
        scribe.use(new ScribeTextBlockPlugin(this));

        // add H1, H2 and H3 support
        scribe.use(scribeBuild.scribePluginHeadingCommand(1));
        scribe.use(scribeBuild.scribePluginHeadingCommand(2));
        scribe.use(scribeBuild.scribePluginHeadingCommand(3));

        scribe.on('content-changed', () => this.toggleEmptyClass());
    },

    controls: {
        heading1(e) {
            e.preventDefault();
            this.focus();
            this._scribe.commands.h1.execute();
        },

        heading2(e) {
            e.preventDefault();
            this.focus();
            this._scribe.commands.h2.execute();
        },

        heading3(e) {
            e.preventDefault();
            this.focus();
            this._scribe.commands.h3.execute();
        }
    },

    scribeOptions: {
        allowBlockElements: false,
        tags: {
            p: false
        }
    },

    loadData({ text = '' }) {
        this.setTextBlockHTML(text);
    },

    onBlockRender() {
        if (this.isEmpty()) {
            this.focus();
            this._scribe.commands.h1.execute();
        }
        this.toggleEmptyClass();
    },

    isEmpty() {
        return this._scribe.getTextContent() === '';
    },

    toggleEmptyClass() {
        this.el.classList.toggle('st-block--empty', this.isEmpty());
    }
});
