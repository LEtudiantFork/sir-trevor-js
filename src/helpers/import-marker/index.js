import Marked from 'marked';

import { LIST_ITEM, QUOTE, noop } from './variables';

/**
 * Bypass Lexer's rules for Marked
 * @type {Marked}
 */
const LEXER_RULES = {
    hr: noop,
    code: noop,
    heading: /^ *(#{1,3}) *([^\n]+?) *#* *(?:\n+|$)/
};
const LEXER_INLINE_RULES = {
    code: noop,
    del: noop
};
const lexer = new Marked.Lexer({});
lexer.rules = Object.assign({}, lexer.rules, LEXER_RULES);

/**
 * Bypass Lexer's renderer for Marked
 * @type {Marked}
 */
const renderer = new Marked.Renderer();
renderer.listitem = text => `${ LIST_ITEM }${ text }`;
renderer.list = body => body;
renderer.heading = (text, level) => `<h${ level }>${ text }</h${ level }>`;
renderer.blockquote = text => `${ QUOTE }${ text }`;
renderer.strong = text => `<b>${ text }</b>`;
renderer.em = text => `<i>${ text }</i>`;
renderer.image = renderer.link;

/**
 * Bypass Parser for Marked, return an array instead of a string
 * @type {Marked}
 */
Marked.parser = function(src, options, renderer) {
    const parser = new Marked.Parser(options, renderer);

    parser.parse = function(src) {
        this.inline = new Marked.InlineLexer(src.links, this.options, this.renderer);
        this.inline.rules = Object.assign({}, this.inline.rules, LEXER_INLINE_RULES);

        this.tokens = src.reverse();

        let out = [];

        while (this.next()) {
            out.push(this.tok().replace(/\n$/, '').replace(/\n/g, '<br>'));
        }

        return out;
    };

    return parser.parse(src);
};

const MARKED_OPTS = {
    gfm: true,
    tables: false,
    smartLists: false,
    renderer
};

export default value => Marked.parser(lexer.lex(value || ''), MARKED_OPTS);
