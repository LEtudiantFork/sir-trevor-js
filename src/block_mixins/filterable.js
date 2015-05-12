'use strict';

var $ = require('jquery');
var _ = require('../lodash');
var xhr = require('etudiant-mod-xhr');

var FilterBar = function(blockReference, container, config) {
    this.blockReference = blockReference;
    this.$container = container;
    this.config = config;

    this.template = _.template([
        '<div class="st-block__filter">',
            '<input type="search" />',
            '<select>',
                '<%= options %>',
            '</select>',
        '</div>'
    ].join('\n'));
};

FilterBar.prototype = {
    render: function() {
        var optionTemplate = _.template('<option value="<%= value %>"><%= label %></option>');

        var optionMarkup = '';

        this.config.options.forEach(function(option) {
            optionMarkup += optionTemplate({
                value: option.value,
                label: option.label
            });
        });

        return this.template({
            options: optionMarkup
        });
    },

    ready: function() {
        this.$elem.on('keyup', 'input[type="search"]', _.debounce(function(event) {
            this.search();
        }.bind(this), 300));

        this.$elem.on('change', 'select', function(event) {
            this.search();
        }.bind(this));
    },

    search: function() {
        var search = {};

        /* * /
        var fulltext = this.$header.find('input[type="search"]').val();

        if (fulltext) {
            search.fulltext = fulltext;
        }

        var id = this.$header.find('select').val();

        if (id) {
            search.id_thematique = fulltext;
        }

        search.limit = 10;

        search._start = 10;
        search._end = 10;
        search.offset = 10;

        /**/

        var searchUrl = xhr.paramizeUrl(this.config.url, search);

        xhr.get(searchUrl)
            .then(function(results) {
                this.blockReference.onFilter(results);
            }.bind(this));
    }
};

Object.defineProperty(FilterBar.prototype, '$elem', {
    get: function $elem() {
        return this.$container.find('.st-block__filter');
    }
});

module.exports = {

    mixinName: 'Filterable',

    initializeFilterable: function() {

        if (this.filterConfig) {

            var filterBar = new FilterBar(this, this.$inner, this.filterConfig);

            this.$inner.html(filterBar.render());

            filterBar.ready();
        }
    }
};
