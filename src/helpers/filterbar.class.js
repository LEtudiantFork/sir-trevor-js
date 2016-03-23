var _           = require('../lodash.js');
var xhr         = require('etudiant-mod-xhr').default;
var eventablejs = require('eventablejs');

var fieldHelper = require('./field.js');

var searchBuilder = function($elem) {
    var search = {};
    var $fields = $elem.find('input, select');

    $fields.each(function() {
        if (this.value) {
            search[this.name] = this.value;
        }
    });

    return search;
};

var filterBarTemplate = `
    <div class="st-block__filter-wrapper">
        <form name="" class="st-block__filter">
            <%= fields %>
        </form>
    </div>
`;

var FilterBar = function(params) {
    this.accessToken = params.accessToken;
    this.app = params.app;
    this.application = params.application;
    this.fields = params.fields;
    this.limit = params.limit;
    this.subType = params.subType;
    this.template = filterBarTemplate;
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
};

FilterBar.prototype = Object.assign(FilterBar.prototype, {

    render: function() {
        var fieldMarkup = '';

        this.fields.forEach(function(field) {
            fieldMarkup += fieldHelper.build(field);
        });

        return _.template(filterBarTemplate)({ fields: fieldMarkup });
    },

    bindToDOM: function(container) {
        this.$elem = container.find('.st-block__filter');

        this.$elem.on('keyup', 'input', _.debounce(() => {
            this.search();
        }, 300));

        this.$elem.on('change', 'select', () => {
            this.search();
        });
    },

    search: function(search, eventName) {
        search = search || {};
        eventName = eventName || 'search';

        this.trigger(eventName + ':start');

        search = Object.assign(search, searchBuilder(this.$elem), {
            access_token: this.accessToken,
            limit: this.limit,
            application: this.app
        });

        if (this.type) {
            search.type = this.type;
        }

        if (this.application) {
            search.application = this.application;
        }


        this.nextSearch = search;

        xhr.get(this.url, {
            data: search
        })
        .then((searchResult) => {
            if (searchResult.content) {
                this.trigger(eventName + ':result', searchResult.content);
                this.nextSearch.offset = this.nextSearch.offset ? this.nextSearch.offset += searchResult.content.length : searchResult.content.length;
            }
            else {
                this.trigger(eventName + ':no-result');
            }
        })
        .catch((err) => {
            this.trigger(eventName + ':error', err);
        });
    },

    moreResults: function() {
        this.search(this.nextSearch, 'update');
    },

    destroy: function() {
        this.$elem.parent().remove();
    }

}, eventablejs);

module.exports = FilterBar;
