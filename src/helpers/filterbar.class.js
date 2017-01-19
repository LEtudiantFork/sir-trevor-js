import { debounce } from '../lodash.js';
import eventablejs from 'eventablejs';
import fieldHelper from './field';

import $ from 'etudiant-mod-dom';
import xhr from 'etudiant-mod-xhr';

function template(fields) {
    return `
    <div class="st-block__filter-wrapper">
        <form name="" class="st-block__filter">
            ${ fields }
        </form>
    </div>
    `;
}

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
function init({ accessToken, app, application, fields, limit, type, subType, url, container, miniature, before }) {
    this.accessToken = accessToken;
    this.app = app;
    this.application = application;
    this.fields = fields;
    this.limit = limit;
    this.type = type;
    this.subType = subType;
    this.url = url;
    this.miniature = miniature;

    this.render(container, before);
}

function searchBuilder($elem) {
    const search = {};
    const $fields = $elem.find('input, select');

    $fields.each(field => {
        if (field.value) {
            search[field.name] = field.value;
        }
    });

    return search;
}

export default {
    create(...args) {
        const instance = Object.assign({}, this.prototype, eventablejs);

        init.apply(instance, args);

        return instance;
    },

    prototype: {
        render(container, before = false) {
            const fieldsTemplates = this.fields.reduce((prev, field) => `${ prev }${ fieldHelper.buildFields(field) }`, '');

            this.$elem = $(template(fieldsTemplates));
            this.$elem.on('input', 'input', debounce(() => this.search(), 300));
            this.$elem.on('change', 'select', () => this.search());

            this.fields
                .filter(field => field.type === 'select' && field.options.then)
                .forEach(select => {
                    const $select = this.$elem.find(`select#${ select.name }`);

                    select.options.then((options = []) => {
                        const optionsTemplate = fieldHelper.buildOptions(options);
                        $select.append(optionsTemplate);
                        $select.removeAttr('disabled');
                        $select.find('option[placeholder]').attr('disabled', true).attr('selected', true);
                    })
                    .catch(err => console.error(err));
                });

            if (before) {
                container.before(this.$elem);
            }
            else {
                container.append(this.$elem);
            }
        },

        search(search = {}, eventName = 'search') {
            this.trigger(eventName + ':start');

            const data = Object.assign({}, search, searchBuilder(this.$elem),
                {
                    'access_token': this.accessToken,
                    limit: this.limit,
                    application: this.application || this.app,
                });

            if (this.type) {
                data.type = this.type;
            }

            if (this.miniature) {
                data.miniature = this.miniature;
            }

            this.nextSearch = data;

            this.trigger(eventName + ':loading');

            xhr.get(this.url, { data })
            .then(({ content }) => {
                this.trigger(eventName + ':done-loading');

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
            this.$elem.off('input change');
            this.$elem.parent().remove();
            this.$elem = null;
        }

    }
};
