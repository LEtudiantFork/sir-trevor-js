import $ from 'etudiant-mod-dom';

import Slide from './slide.class.js';

const _           = require('../lodash');
const eventablejs = require('eventablejs');

const sliderTemplate = `
    <div class="st-block__slider">
        <div class="st-slider">
            <div class="st-slider-container">
            </div>
        </div>
        <% if (controls) { %>
            <div class="st-slider-controls">
                <% _.forEach(controls, function(control, key) { %>
                    <button class="st-btn" data-direction="<%= key %>">
                        <span><%= control %></span>
                    </button>
                <% }); %>
            </div>
        <% } %>
    </div>
`;

const noSlidesTemplate = `
    <span class="st-slider-no-slides">
        ${i18n.t('slider:no_results')}
    </span>
`;

function init(params) {
    this.slides = [];
    this.template = sliderTemplate;

    this.config = {
        itemsPerSlide: params.itemsPerSlide,
        increment: params.increment,
        controls: params.controls
    };

    this.slides = prepareSlides(params.contents, this.config.itemsPerSlide);

    this.render();

    if (params.container) {
        params.container.append(this.$elem);
    }
}

function canGoTo(index) {
    return !(index < 0 || index > this.slides.length - 1);
}

function calculateSliderDimensions(reset) {
    this.$slides = this.$slideContainer.find('.st-slider-slide');

    if (this.$slides.length > 0) {
        this.$slides.css('width', (this.$elem.dim().width / this.config.increment) + 'px');
        this.$slideContainer.css('width', (this.$slides[0].clientWidth * this.$slides.length) + 'px');

        if (reset) {
            this.currentIndex = 0;
            this.$slideContainer.css('left', '0%');
        }
    }
    else {
        this.$slideContainer.css('width', 'auto');
    }
}

function checkButtons() {
    if (this.currentIndex === 0 || this.slides.length === 0) {
        this.trigger('buttons:prev:disable');
    }
    else {
        this.trigger('buttons:prev:enable');
    }

    if (this.currentIndex === this.slides.length - 1) {
        this.trigger('buttons:next:disable');
    }
    else {
        this.trigger('buttons:next:enable');
    }
}

function checkProgress() {
    var progress = Math.round((this.currentIndex / this.slides.length) * 100);

    if (progress > 50 && this.hasEmitted !== true) {
        this.trigger('progress');
        this.hasEmitted = true;
    }
}

function prepareSlides(slideContents, itemsPerSlide, indexModifier) {
    return _.chunk(slideContents, itemsPerSlide).map((slideContentItem, index) => {
        return Slide.create(
            indexModifier ? indexModifier + index : index,
            slideContentItem,
            itemsPerSlide
        );
    });
}

function registerButtons() {
    var prevButton = this.$elem.find('.st-slider-controls button[data-direction="prev"]');
    var nextButton = this.$elem.find('.st-slider-controls button[data-direction="next"]');

    this.$elem.on('click', '.st-slider-controls button', e => {
        e.preventDefault();
        if (this[$(e.currentTarget).data('direction')]) {
            this[$(e.currentTarget).data('direction')].call(this);
        }
    });

    this.on('buttons:prev:disable', () => prevButton.attr('disabled', 'disabled'));

    this.on('buttons:prev:enable', () => prevButton.removeAttr('disabled'));

    this.on('buttons:next:disable', () => nextButton.attr('disabled', 'disabled'));

    this.on('buttons:next:enable', () => nextButton.removeAttr('disabled'));
}

function createElement(controls) {
    return $(
        _.template(sliderTemplate, { imports: { '_': _ } })({
            controls: controls
        })
    );
}

export default {
    create() {
        const instance = Object.assign(Object.create(this.prototype), eventablejs);

        init.apply(instance, arguments);

        return instance;
    },

    prototype: {
        destroy() {
            this.$elem.remove();
        },

        detach() {
            this.$elem.detach();
        },

        goTo(index) {
            this.$slideContainer.css('left', '-' + ((100 / this.config.increment).toFixed(2) * index) + '%');

            this.currentIndex = index;

            checkProgress.call(this);
            checkButtons.call(this);
        },

        next() {
            let newIndex = this.currentIndex + 1;

            if (canGoTo.call(this, newIndex)) {
                this.goTo(newIndex);
            }
        },

        prev() {
            let newIndex = this.currentIndex - 1;

            if (canGoTo.call(this, newIndex)) {
                this.goTo(newIndex);
            }
        },

        refreshDimensions(reset) {
            calculateSliderDimensions.call(this, reset);
            checkButtons.call(this);
        },

        render() {
            this.$elem = createElement(this.config.controls);

            this.$slideContainer = this.$elem.find('.st-slider-container');

            this.slides.forEach(slide => {
                this.$slideContainer.append(slide.render());
            });

            if (!this.isBoundToDOM) {

                if (this.config.controls) {
                    registerButtons.call(this);
                }

                this.refreshDimensions(true);

                this.isBoundToDOM = true;
            }

            return this.$elem;
        },

        reset(newSlides) {
            this.slides = [];
            this.hasEmitted = false;

            if (newSlides) {
                this.$slideContainer.empty();

                this.slides = prepareSlides(newSlides, this.config.itemsPerSlide);

                this.slides.forEach(slide => {
                    this.$slideContainer.append(slide.render());
                });
            }
            else {
                this.$slideContainer.html(noSlidesTemplate);
            }

            this.refreshDimensions(true);
        },

        update(additionalSlides) {
            let indexModifier;
            let lastSlide = this.slides[this.slides.length - 1];

            indexModifier = this.slides.indexOf(lastSlide) + 1;

            if (!lastSlide.isFull()) {
                this.$slides.last().remove();

                indexModifier = this.slides.indexOf(lastSlide);

                while (!lastSlide.isFull()) {
                    lastSlide.addItem(additionalSlides.pop());
                }

                lastSlide.render();
            }

            let newSlides = prepareSlides(additionalSlides, this.config.itemsPerSlide, indexModifier);

            this.slides = this.slides.concat(newSlides);

            this.slides.slice(indexModifier, this.slides.length).forEach(slide => {
                this.$slideContainer.append(slide.render());
            });

            this.refreshDimensions(false);
            this.hasEmitted = false;
        }
    }
};
