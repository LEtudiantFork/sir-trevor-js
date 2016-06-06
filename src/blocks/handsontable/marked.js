import Marked from 'marked';

function noop() {}
noop.exec = noop;

/**
 * Bypass Lexer's rules for Marked, that way markdown specific block are avoided
 * @type {Marked}
 */
const Lexer = new Marked.Lexer({});
Lexer.rules = Object.assign({}, Lexer.rules);
Lexer.rules.blockquote = noop;
Lexer.rules.code = noop;
Lexer.rules.heading = noop;
Lexer.rules.hr = noop;
Lexer.rules.list = noop;

/**
 * Bypass Lexer's renderer for Marked, that way no balise p are injected
 * @type {Marked}
 */
const renderer = new Marked.Renderer();
renderer.paragraph = text => text; // override paragraph
renderer.link = (href, title, text) => `<a href="${ href }" ${ title ? `title="${ title }"` : '' } target="_blank">${ text }</a>`;

const MARKED_OPTS = {
    gfm: true,
    tables: false,
    smartLists: false,
    renderer
};

export default value => Marked.parser(Lexer.lex(value || ''), MARKED_OPTS);
