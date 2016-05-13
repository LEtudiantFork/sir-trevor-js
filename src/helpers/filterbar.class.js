import * as _ from '../lodash.js';
import eventablejs from 'eventablejs';
import fieldHelper from './field';

import xhr from 'etudiant-mod-xhr';

const filterBarTemplate = `
    <div class="st-block__filter-wrapper">
        <form name="" class="st-block__filter">
            <%= fields %>
        </form>
    </div>
`;

/**
 * @param  {string} options.accessToken
 * @param  {Object} options.app
 * @param  {string} options.application
 * @param  {Object[]} options.fields
 * @param  {number} options.limit
 * @param  {string} options.type
 * @param  {string} options.subType
 * @param  {string} options.url
 * @param  {Object} options.container
 * @param  {boolean} options.before
 */
function init({ accessToken, app, application, fields, limit, type, subType, url, container, before }) {
    this.accessToken = accessToken;
    this.app = app;
    this.application = application;
    this.fields = fields;
    this.limit = limit;
    this.type = type;
    this.subType = subType;
    this.url = url;

    if (container) {
        if (before === true) {
            container.before(this.render(this.fields));
            this.bindToDOM(container.parent());
        }
        else {
            container.append(this.render(this.fields));
            this.bindToDOM(container);
        }
    }
}

function searchBuilder($elem) {
    var search = {};
    var $fields = $elem.find('input, select');

    $fields.each(function() {
        if (this.value) {
            search[this.name] = this.value;
        }
    });

    return search;
}

export default {
    create(...args) {
        const instance = Object.assign(Object.create(this.prototype), eventablejs);

        init.apply(instance, args);

        return instance;
    },

    prototype: {

        render() {
            const fields = this.fields.reduce((prev, field) => `${ prev }${ fieldHelper.build(field) }`, '');

            return _.template(filterBarTemplate)({ fields });
        },

        bindToDOM(container) {
            this.$elem = container.find('.st-block__filter');

            this.$elem.on('keyup', 'input', _.debounce(() => this.search(), 300));
            this.$elem.on('change', 'select', () => this.search());
        },

        search(search = {}, eventName = 'search') {
            this.trigger(eventName + ':start');

            const data = Object.assign({}, search, searchBuilder(this.$elem), {
                access_token: this.accessToken,
                limit: this.limit,
                application: this.application || this.app
            });

            if (this.type) {
                data.type = this.type;
            }

            this.nextSearch = data;

            xhr.get(this.url, { data })
            .then(({ content }) => {
                if (content) {
                    this.trigger(eventName + ':result', content);
                    this.nextSearch.offset = (this.nextSearch.offset || 0) + content.length;
                }
                else {
                    this.trigger(eventName + ':no-result');
                }
            })
            .catch(err => this.trigger(eventName + ':error', err));
        },

        moreResults() {
            this.search(this.nextSearch, 'update');
        },

        destroy() {
            this.$elem.parent().remove();
        }

    }
};
