var _      = require('../../../lodash.js');
var Slider = require('../../../helpers/slider.class.js');

var smallTemplate = [
    '<figure class="st-sub-block-diaporama">',
        '<img src="<%= thumbnail %>" />',
    '</figure>',
    '<h3><%= legend %></h3>',
    '<a class="st-sub-block-link st-icon" href="<%= file %>" target="_blank">link</a>'
].join('\n');

var largeTemplate = [
    '<div class="st-sub-block-diaporama">',
        '<div class="st-sub-block-diaporama_slides">',
            '<%= slides %>',
        '</div>',
        '<div class="st-sub-block-diaporama_thumbs">',
            '<%= thumbs %>',
        '</div>',
    '</div>'
].join('\n');

var slideTemplate = [
    '<figure data-index="<%= index %>" class="st-sub-block-diaporama_slide">',
        '<img src="<%= file %>" />',
    '</figure>'
].join('\n');

var thumbTemplate = [
    '<a href="#" data-index="<%= index %>" class="st-sub-block-diaporama_thumb">',
        '<img src="<%= file %>" />',
    '</a>'
].join('\n');

function init() {
    this.smallTemplate = smallTemplate;
    this.largeTemplate = largeTemplate;
}

function renderSlide(file, index) {
    return _.template(slideTemplate, {
        file: file,
        index: index
    });
}

function renderThumb(file, index) {
    return _.template(thumbTemplate, {
        file: file,
        index: index
    });
}

var diaporamaPrototype = {
    prepareSmallMarkup: function() {
        return _.template(smallTemplate, this.content, { imports: { '_': _ } });
    },

    prepareLargeMarkup: function() {
        var thumbs = this.content.images.reduce(function(previous, current, index) {
            if (index === 1) {
                previous = renderThumb(previous.thumbnail, 0);
            }

            return previous += renderThumb(current.thumbnail, index);
        });

        var slides = this.content.images.reduce(function(previous, current, index) {
            if (index === 1) {
                previous = renderSlide(previous.file, 0);
            }

            return previous += renderSlide(current.file, index);
        });

        var toRender = {
            slides: slides,
            thumbs: thumbs
        };

        return _.template(largeTemplate, toRender);
    },

    renderLarge: function() {
        this.prepareForRender();

        this.$elem.append(this.prepareLargeMarkup());

        this.$elem.addClass('st-sub-block-size-large');

        this.renderedAs = 'large';

        if ('postRenderLarge' in this) {
            this.postRenderLarge();
        }

        return this.$elem;
    }
};

module.exports = {
    init: init,
    prototype:diaporamaPrototype
};
