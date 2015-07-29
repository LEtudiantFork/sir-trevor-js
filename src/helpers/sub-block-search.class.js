var $           = require('jquery');
var eventablejs = require('eventablejs');

var EventBus        = require('../event-bus.js');
var FilterBar       = require('./filterbar.class.js');
var Slider          = require('./slider.class.js');
var subBlockManager = require('../sub_blocks/sub-block-manager.js');

function registerSelectSubBlock(subBlockSearch) {
    EventBus.on('sub-block-action:selected', function(subBlock) {
        if (subBlock.parentID === subBlockSearch.id) {
            subBlockSearch.trigger('selected', subBlock);
        }
    });
}

function filterUpdate(subBlockSearch) {
    subBlockSearch.slider.on('progress', function() {
        subBlockSearch.filterBar.moreResults();
    });

    subBlockSearch.filterBar.on('update:result', function(updateResults) {

        if (subBlockSearch.subBlockPreProcess) {
            updateResults = subBlockSearch.subBlockPreProcess(updateResults);
        }

        var additionalSubBlocks = subBlockManager.build({
            accessToken: subBlockSearch.accessToken,
            apiUrl: subBlockSearch.apiUrl,
            application: subBlockSearch.application,
            contents: updateResults,
            parentID: subBlockSearch.id,
            type: subBlockSearch.subBlockType
        });

        subBlockSearch.subBlocks = subBlockSearch.subBlocks.concat(additionalSubBlocks);

        subBlockSearch.slider.update(subBlockManager.render(additionalSubBlocks));
    });
}

function filterSearch(subBlockSearch) {
    subBlockSearch.filterBar.on('search:start', function() {});

    subBlockSearch.filterBar.on('search:result', function(searchResults) {

        if (subBlockSearch.subBlockPreProcess) {
            searchResults = subBlockSearch.subBlockPreProcess(searchResults);
        }

        subBlockSearch.subBlocks = subBlockManager.build({
            accessToken: subBlockSearch.accessToken,
            apiUrl: subBlockSearch.apiUrl,
            application: subBlockSearch.application,
            contents: searchResults,
            parentID: subBlockSearch.id,
            type: subBlockSearch.subBlockType
        });

        subBlockSearch.slider.reset(subBlockManager.render(subBlockSearch.subBlocks));
    });

    subBlockSearch.filterBar.on('search:no-result', function() {
        subBlockSearch.subBlocks = [];
        subBlockSearch.slider.reset();
    });
}

function filterOptionsIncomplete(filterConfig) {
    return filterConfig.fields.some(function(field) {
        return field.options && 'then' in field.options;
    });
}

function prepareFilterConfig(filterConfig) {

    // if the filter's options fields are already present, resolve immediately
    if (!filterOptionsIncomplete(filterConfig)) {
        return Promise.resolve();
    }

    var promises = [];

    filterConfig.fields.forEach(function(field) {
        if (field.options && 'then' in field.options) {
            promises.push(field.options);
        }
    });

    return Promise.all(promises)
            .then(function(fetchedOptions) {
                fetchedOptions.forEach(function(fetchedOption) {
                    filterConfig.fields.forEach(function(filterField) {
                        if (filterField.name === fetchedOption.name) {
                            filterField.options = fetchedOption.options;
                        }
                    });
                });

                return Promise.resolve();
            })
            .catch(function(err) {
                console.error(err);
            });
}

var SubBlockSearch = function(params) {
    this.id = Date.now();

    this.apiUrl = params.apiUrl;
    this.application = params.application;
    this.accessToken = params.accessToken;
    this.$container = params.$container;
    this.subBlockType = params.subBlockType;
    this.subBlockPreProcess = params.subBlockPreProcess;

    this.subBlocks = [];

    // create container element
    this.$elem = $('<div class="st-sub-block-search"></div>');

    params.filterConfig.container = this.$elem;
    params.sliderConfig.container = this.$elem;

    this.trigger('loading');

    prepareFilterConfig(params.filterConfig)
        .then(function() {
            this.filterBar = new FilterBar(params.filterConfig);

            this.slider = new Slider(params.sliderConfig);

            this.trigger('show');

            this.$elem.appendTo(this.$container);

            filterUpdate(this);
            filterSearch(this);

            this.filterBar.search();

            this.filterBar.once('search:result', function() {
                this.trigger('ready');
            }.bind(this));

            registerSelectSubBlock(this);

        }.bind(this))
        .catch(function(err) {
            console.error(err);
        });
};

var prototype = {
    refreshDimensions: function() {
        this.slider.refreshDimensions(true);
    },

    destroy: function() {
        this.$elem.remove();
    }
};

SubBlockSearch.prototype = Object.assign({}, prototype, eventablejs);

module.exports = SubBlockSearch;
