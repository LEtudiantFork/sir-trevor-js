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

    controls() {
        this.headings = [ 'h2', 'h3', 'h1' ];
        this.labels = {
            'h1': 'Titre',
            'h2': 'Inter-titre',
            'h3': 'Sous-Inter'
        };

        const controls = this.headings.map((heading, index) => {
            return {
                event: 'click',
                html: `<button type="button" class="st-control-block st-btn">${ this.labels[heading] }</button>`,
                cssClasses: index === 0 ? 'st-block__control-ui__item is-active' : 'st-block__control-ui__item',
                cb(e) {
                    e.preventDefault();

                    if (!e.currentTarget.classList.contains("is-active")) {

                        e.currentTarget.classList.add("is-active");
                        var sibblings = e.currentTarget.parentNode.childNodes;
                        for (var i = 0, lgth = sibblings.length; i<lgth; i++) {
                            if (sibblings[i] !== e.currentTarget) {
                                sibblings[i].classList.remove("is-active");
                            }
                        }

                        this.focus();
                        document.execCommand('selectAll',false,null); //FIX Firefox
                        this._scribe.commands[heading].execute();
                    }
                }
            };
        });

        return Object.assign.call({}, controls);
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
            this._scribe.commands.h2.execute();
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
