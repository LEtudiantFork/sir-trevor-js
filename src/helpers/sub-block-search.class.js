var eventablejs = require('eventablejs');
var xhr         = require('etudiant-mod-xhr');

var FilterBar = require('./filterbar.class.js');
var Slider    = require('./slider.class.js');

var utils = require('../utils.js');

var subBlockManager = require('../sub_blocks/sub-block-manager.js');

function registerClickOnContents(block) {
    subBlockManager.bindEventsOnContainer('click', block.$inner, function(selectedSubBlockId) {
        var selectedSubBlock = subBlockManager.getSubBlockById(selectedSubBlockId, block.subBlocks);

        block.subBlockSearch.trigger('selected', selectedSubBlock);
    });
}

function filterUpdate(block, subBlockType) {
    block.slider.on('progress', function() {
        block.filterBar.moreResults();
    });

    block.filterBar.on('update:result', function(results) {
        var additionalSubBlocks = subBlockManager.build(subBlockType, results);
        var subBlockMarkup = subBlockManager.render(additionalSubBlocks);

        block.subBlocks = block.subBlocks.concat(additionalSubBlocks);

        block.slider.update(subBlockMarkup);
    });
}

function filterSearch(block, subBlockType) {
    block.filterBar.on('search:start', function() {
        // on search start
    });

    block.filterBar.on('search:result', function(results) {
        block.subBlocks = subBlockManager.build(subBlockType, results);

        var subBlockMarkup = subBlockManager.render(block.subBlocks);

        block.slider.reset(subBlockMarkup);
    });

    block.filterBar.on('search:no-result', function() {
        block.subBlocks = [];
        block.slider.reset();
    });
}

function filterOptionsIncomplete(filterConfig) {
    return filterConfig.fields.some(function(field) {
        return field.options && 'then' in field.options;
    });
}

function prepareFilterConfig(filterConfig) {
    if (!filterOptionsIncomplete(filterConfig)) {
        return Promise.resolve();
    }
    else {
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
}

var SubBlockSearch = function() {
    this.init.apply(this, arguments);
};

var prototype = {
    init: function(params) {
        var block = this.block = params.block;

        var apiUrl = params.apiUrl;
        var filterConfig = params.filterConfig;
        var sliderConfig = params.sliderConfig;

        block.loading();

        block.subBlocks = [];

        prepareFilterConfig(filterConfig)
            .then(function() {
                block.filterBar = new FilterBar(filterConfig);

                block.slider = new Slider(sliderConfig);

                filterUpdate(block, block.subBlockType);
                filterSearch(block, block.subBlockType);

                block.filterBar.search();

                block.filterBar.once('search:result', function() {
                    block.ready();
                    this.trigger('ready');
                    utils.log('subBlockSearch triggered ready');

                    registerClickOnContents(block);
                }.bind(this));

            }.bind(this))
            .catch(function(err) {
                console.error(err);
            });
    },

    destroy: function() {
        this.block.filterBar.destroy();
        this.block.slider.destroy()

        subBlockManager.unBindEventsOnContainer(this.block.$inner);

        this.block.filterBar = null;
        this.block.slider = null;
    }
};

SubBlockSearch.prototype = Object.assign({}, prototype, eventablejs);

module.exports = SubBlockSearch;
