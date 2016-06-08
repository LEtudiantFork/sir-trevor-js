export const LIST_ITEM = ':-:';
export const QUOTE = ':quote:';

export const BLOCKS = {
    text: {
        reg: /^<p>/i,
        valueKey: 'text'
    },
    heading: {
        reg: /^<h[1-3]>/i,
        valueKey: 'text'
    },
    quote: {
        reg: new RegExp(`^${ QUOTE }`, 'i'),
        valueKey: 'text'
    },
    list: {
        reg: new RegExp(`^${ LIST_ITEM }`, 'i'),
        valueKey: 'listItems'
    }
};

export function noop() {}
noop.exec = noop;
