import $ from 'etudiant-mod-dom';
import randomID from 'random-id';

import Slider from './slider.class';
import FilterBar from './filterbar.class';

import subBlockManager from './sub-blocks';

import eventablejs from 'eventablejs';
import EventBus    from '../event-bus';

function init({ container, subBlockType, subBlockPreProcess, filterConfig, sliderConfig }) {
    this.id = randomID();

    this.container = container;
    this.subBlockType = subBlockType;
    this.subBlockPreProcess = subBlockPreProcess; // @todo is this in the right place?

    this.subBlocks = [];

    // create container element
    this.$elem = $('<div class="st-pandora-search"></div>');

    filterConfig.container = this.$elem;
    sliderConfig.container = this.$elem;

    this.filterBar = FilterBar.create(filterConfig);

    this.slider = Slider.create(sliderConfig);

    this.$elem.appendTo(this.container);

    EventBus.on('sub-block:selected', block => {
        if (block.parentID === this.id) {
            this.trigger('selected', block);
        }
    });

    this.filterBar.once('search:result', () => this.trigger('ready'));

    this.filterBar.on('search:result', results => this.showResults(results));
    this.filterBar.on('search:no-result', () => this.resetResults());

    this.filterBar.on('search:loading', () => {
        this.slider.isLoading();
    });

    this.filterBar.on('search:done-loading', () => {
        this.slider.isDoneLoading();
    });

    this.filterBar.on('update:result', updateResults => this.updateResults(updateResults));

    this.filterBar.search();

    this.slider.on('progress', () => this.filterBar.moreResults());
}

export default {
    create() {
        const instance = Object.assign(Object.create(this.prototype), eventablejs);

        init.apply(instance, arguments);

        return instance;
    },

    prototype: {
        resetResults() {
            this.subBlocks = [];
            this.slider.reset();
        },

        showResults(results) {
            const contents = (this.subBlockPreProcess) ? this.subBlockPreProcess(results) : results;

            this.subBlocks = subBlockManager.buildMultiple({
                contents,
                parentID: this.id,
                type: this.subBlockType
            });

            this.slider.reset(
                subBlockManager.renderMultiple(this.subBlocks)
            );
        },

        updateResults(updateResults) {
            const contents = (this.subBlockPreProcess) ? this.subBlockPreProcess(updateResults) : updateResults;

            const additionalSubBlocks = subBlockManager.buildMultiple({
                contents,
                parentID: this.id,
                type: this.subBlockType
            });

            this.subBlocks = this.subBlocks.concat(additionalSubBlocks);

            // @todo slides back to previous position - bad UX
            this.slider.update(
                subBlockManager.renderMultiple(additionalSubBlocks)
            );
        },

        refreshDimensions: function() {
            this.slider.refreshDimensions(true);
        },

        destroy: function() {
            this.$elem.remove();
            this.$elem = null;
        }
    }
};
