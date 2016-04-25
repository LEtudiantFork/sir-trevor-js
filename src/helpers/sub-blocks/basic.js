import $ from 'etudiant-mod-dom';

import * as templates from './templates.tpl.js';

import * as _ from '../../lodash.js';
import EventBus from '../../event-bus.js';

const wrapperTemplate = '<div class="st-sub-block"></div>';

function init(params) {
    this.id = params.content.id;

    this.content = params.content;
    this.parentID = params.parentID;
    this.type = params.type;

    this.$elem = $(wrapperTemplate);

    this.$elem.attr('data-sub-block-id', this.id);
    this.$elem.addClass(`st-sub-block--${this.type} st-sub-block-size-small`);

    this.$elem.on('click', e => {
        if (!(e.target.target === '_blank' && e.target.href)) {
            e.preventDefault();

            EventBus.trigger('sub-block:selected', this);
        }
    });
}

export default {
    create() {
        const instance = Object.create(this.prototype);

        init.apply(instance, arguments);

        return instance;
    },

    prototype: {
        render() {
            this.$elem.empty();

            let markup = _.template(templates[this.type], { imports: { '_': _ } })({ data: this.content });

            this.$elem.append(markup);

            return this.$elem;
        }
    }
};
