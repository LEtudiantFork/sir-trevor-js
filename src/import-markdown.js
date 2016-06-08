/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks importing markdown.
 */

import marked from './helpers/import-marker';
import { BLOCKS } from './helpers/import-marker/variables';

import utils from './utils';

import Events from './packages/events';
import { template } from './templates/import-markdown';

export const create = SirTrevor => {
    SirTrevor.wrapper.insertAdjacentHTML('beforeend', template());
    const importer = SirTrevor.wrapper.querySelector('.st-import-markdown');
    const field = importer.querySelector('.st-import-markdown--field');

    SirTrevor.mediator.on('block:countUpdate', count => importer.style = `display: ${ count < 1 ? 'initial' : 'none' };`);

    function importMarkdown() {
        const value = field.value.toString().trim();
        const markdown = marked(value);

        markdown.forEach(text => {
            for (let block in BLOCKS) {
                if (BLOCKS.hasOwnProperty(block)) {
                    const { reg, valueKey = 'text' } = BLOCKS[block];

                    if (!reg.test(text)) {
                        continue;
                    }

                    SirTrevor.mediator.trigger(
                        'block:create', utils.classify(block), { [valueKey]: text }, importer.previousSibling
                    );

                    break;
                }
            }
        });
    }

    Events.delegate(importer, '.st-import-markdown--btn', 'click', importMarkdown);

    // Public
    function destroy() {
        SirTrevor = null;
    }

    return { destroy };
};
