import * as _ from '../lodash.js';
import eventablejs from 'eventablejs';
import fieldHelper from './field.js';
import xhr from 'etudiant-mod-xhr';

const filterBarTemplate = `
    <div class="st-block__filter-wrapper">
        <form name="" class="st-block__filter">
            <%= fields %>
        </form>
    </div>
`;

function init(params) {
    this.accessToken = params.accessToken;
    this.app = params.app;
    this.application = params.application;
    this.fields = params.fields;
    this.limit = params.limit;
    this.subType = params.subType;
    this.type = params.type;
    this.url = params.url;

    if (params.container) {
        if (params.before === true) {
            params.container.before(this.render(this.fields));
            this.bindToDOM(params.container.parent());
        }
        else {
            params.container.append(this.render(this.fields));
            this.bindToDOM(params.container);
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
    create() {
        const instance = Object.assign(Object.create(this.prototype), eventablejs);

        init.apply(instance, arguments);

        return instance;
    },

    prototype: {

        render() {
            var fieldMarkup = '';

            this.fields.forEach(function(field) {
                fieldMarkup += fieldHelper.build(field);
            });

            return _.template(filterBarTemplate)({ fields: fieldMarkup });
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
}
