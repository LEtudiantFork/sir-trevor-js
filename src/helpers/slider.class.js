var $ = require('jquery');
var eventablejs = require('eventablejs');
var _ = require('../lodash');
var animate = require('velocity-commonjs/velocity.ui');

var Slide = require('./slide.class.js');

var canGoTo = function(index) {
    return !(index < 0 || index > this.slides.length - 1);
};

var calculateSliderDimensions = function(reset) {
    this.$slides = this.$slideContainer.find('.st-slider-slide');

    if (this.$slides.length > 0) {
        this.$slides.css('width', (this.$elem.width() / this.config.increment) + 'px');
        this.$slideContainer.css('width', (this.$slides[0].clientWidth * this.$slides.length) + 'px');

        if (reset) {
            this.currentIndex = 0;
            this.$slideContainer.css('left', '0%');
        }
    }
    else {
        this.$slideContainer.css('width', 'auto');
    }
};

var checkButtons = function() {
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
};

var checkProgress = function() {
    var progress = Math.round((this.currentIndex / this.slides.length) * 100);

    if (progress > 50 && this.hasEmitted !== true) {
        this.trigger('progress');
        this.hasEmitted = true;
    }
};

var prepareSlides = function(slides, itemsPerSlide, indexModifier) {
    var prepared = [];

    _.chunk(slides, itemsPerSlide).forEach(function(slideContent, index) {
        prepared.push(new Slide(
            indexModifier ? indexModifier + index : index,
            slideContent,
            itemsPerSlide
        ));
    });

    return prepared;
};

var registerButtons = function() {
    var prevButton = this.$elem.find('.st-slider-controls button[data-direction="prev"]');
    var nextButton = this.$elem.find('.st-slider-controls button[data-direction="next"]');

    this.$elem.on('click', '.st-slider-controls button', function(e) {
        e.preventDefault();
        if (this[$(e.currentTarget).data('direction')]) {
            this[$(e.currentTarget).data('direction')].call(this);
        }
    }.bind(this));

    this.on('buttons:prev:disable', function() {
        prevButton.attr('disabled', 'disabled');
    });
    this.on('buttons:prev:enable', function() {
        prevButton.removeAttr('disabled');
    });
    this.on('buttons:next:disable', function() {
        nextButton.attr('disabled', 'disabled');
    });
    this.on('buttons:next:enable', function() {
        nextButton.removeAttr('disabled');
    });
};

var sliderTemplate = [
    '<div class="st-block__slider">',
        '<div class="st-slider">',
            '<div class="st-slider-container">',
                '<%= content %>',
            '</div>',
        '</div>',
        '<% if (controls) { %>',
            '<div class="st-slider-controls">',
                '<% _.forEach(controls, function(control, key) { %>',
                    '<button class="st-btn" data-direction="<%= key %>">',
                        '<span><%= control %></span>',
                    '</button>',
                '<% }); %>',
            '</div>',
        '<% } %>',
    '</div>'
].join('\n');

var noSlidesTemplate = [
    '<span class="st-slider-no-slides">',
        'Il n\'y a pas de resultats',
    '</span>'
].join('\n');

// PUBLIC

var Slider = function() {
    this.init.apply(this, arguments);
};

var prototype = {
    init: function(params) {
        this.slides = [];
        this.template = sliderTemplate;

        this.config = {
            itemsPerSlide: params.itemsPerSlide,
            increment: params.increment,
            controls: params.controls
        };

        if (params.contents) {
            this.slides = prepareSlides(params.contents, this.config.itemsPerSlide);
        }

        if (params.container) {
            params.container.append(this.render());
            this.appendToDOM(params.container);
        }
    },

    render: function() {
        var slidesMarkup = '';

        this.slides.forEach(function(slide) {
            slidesMarkup += slide.render();
        });

        return _.template(sliderTemplate, {
            content: slidesMarkup,
            controls: this.config.controls
        }, { imports: { '_': _ }});
    },

    appendToDOM: function(container) {
        this.$elem = container.find('.st-block__slider');
        this.$slideContainer = this.$elem.find('.st-slider-container');

        if (!this.isBoundToDOM) {

            if (this.config.controls) {
                registerButtons.call(this);
            }

            calculateSliderDimensions.call(this, true);
            checkButtons.call(this);

            this.isBoundToDOM = true;
        }
    },

    update: function(additionalSlides) {
        var indexModifier;
        var slidesMarkup = '';
        var lastSlide = this.slides[this.slides.length - 1];

        indexModifier = this.slides.indexOf(lastSlide) + 1;

        if (!lastSlide.isFull()) {
            this.$slides.last().remove();

            indexModifier = this.slides.indexOf(lastSlide);

            while (!lastSlide.isFull()) {
                lastSlide.addItem(additionalSlides.pop());
            }
        }

        var newSlides = prepareSlides(additionalSlides, this.config.itemsPerSlide, indexModifier);

        this.slides = this.slides.concat(newSlides);

        this.slides.slice(indexModifier, this.slides.length).forEach(function(slide) {
            slidesMarkup += slide.render();
        });

        this.$slideContainer.append(slidesMarkup);

        calculateSliderDimensions.call(this, false);
        checkButtons.call(this);
        this.hasEmitted = false;
    },

    reset: function(newSlides) {
        this.slides = [];
        this.hasEmitted = false;

        animate(this.$elem[0], { opacity: 0 }, { duration: 200 })
            .then(function() {
                if (newSlides) {
                    var slidesMarkup = '';

                    this.slides =  prepareSlides(newSlides, this.config.itemsPerSlide);

                    this.slides.forEach(function(slide) {
                        slidesMarkup += slide.render();
                    });

                    this.$slideContainer.html(slidesMarkup);
                }
                else {
                    this.$slideContainer.html(noSlidesTemplate);
                }

                calculateSliderDimensions.call(this, true);
                checkButtons.call(this);

                return Promise.resolve();
            }.bind(this))
            .then(function() {
                return animate(this.$elem[0], { opacity: 1 }, { duration: 200 });
            }.bind(this));
    },

    goTo: function(index) {
        animate(this.$slideContainer[0], { left: '-' + ((100 / this.config.increment).toFixed(2) * index) + '%' }, { queue: false, duration: 400, easing: 'ease-in-out' });

        this.currentIndex = index;

        checkProgress.call(this);
        checkButtons.call(this);
    },

    prev: function() {
        var newIndex = this.currentIndex - 1;

        if (canGoTo.call(this, newIndex)) {
            this.goTo(newIndex);
        }
    },

    next: function() {
        var newIndex = this.currentIndex + 1;

        if (canGoTo.call(this, newIndex)) {
            this.goTo(newIndex);
        }
    },

    destroy: function() {
        this.$elem.remove();
    }
};

Slider.prototype = Object.assign({}, prototype, eventablejs);

module.exports = Slider;
