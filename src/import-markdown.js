/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks importing markdown.
 */
import Marked from 'marked';

import Events from './packages/events';
import { template } from './templates/import-markdown';

const MARKED_PARAMS = {
    gfm: true,
    tables: false,
    smartLists: false
};

function noop() {}
noop.exec = noop;

/**
 * Bypass Lexer's rules for Marked
 * @type {Marked}
 */
const Lexer = new Marked.Lexer({});
Lexer.rules = Object.assign({}, Lexer.rules);
Lexer.rules.code = noop;
Lexer.rules.hr = noop;
Lexer.rules.heading = /^ *(#{1,3}) *([^\n]+?) *#* *(?:\n+|$)/;

/**
 * Bypass Lexer's renderer for Marked
 * @type {Marked}
 */
const Renderer = new Marked.Renderer();
Renderer.heading = (text, level) => `<h${ level }>${ text }</h${ level }>\n`;

/**
 * Bypass Parser for Marked, return an array instead of a string
 * @type {Marked}
 */
Marked.parser = function(src, options, renderer) {
    const parser = new Marked.Parser(options, renderer);

    parser.parse = function(src) {
        this.inline = new Marked.InlineLexer(src.links, this.options, this.renderer);
        this.tokens = src.reverse();

        let out = [];

        while (this.next()) {
            out.push(this.tok().replace(/\n$/, ''));
        }

        return out;
    };

    return parser.parse(src);
};

const MARKED_OPTS = Object.assign({}, MARKED_PARAMS, { renderer: Renderer });

export const create = SirTrevor => {
    SirTrevor.wrapper.insertAdjacentHTML('beforeend', template());
    const field = SirTrevor.wrapper.querySelector('.st-import-markdown--field');

    function importMarkdown() {
        const value = field.value.toString().trim();
        const markdown = Marked.parser(Lexer.lex(value), MARKED_OPTS);

        console.log(markdown);
        /*SirTrevor.mediator.trigger(
            'block:create', 'Text', null, this.parentNode.parentNode.previousSibling
        );*/
    }

    // Public
    function destroy() {
        SirTrevor = null;
    }

    Events.delegate(
        SirTrevor.wrapper, '.st-import-markdown--btn', 'click', importMarkdown
    );

    return { destroy };
};
