var $           = require('jquery');
var eventablejs = require('eventablejs');
var Slider      = require('./slider.class.js');

function prepareThumbs(thumbs) {
    return thumbs.map(function(thumb, index) {
        var wrapper = $('<div></div>');

        wrapper.attr('data-slide-index', index);

        wrapper.append(thumb);

        return wrapper;
    });
}

var diaporamaPrototype = {
    // @todo
};

module.exports = {
    create: function(params) {
        var instance = {};

        instance = Object.assign({}, diaporamaPrototype, eventablejs);

        instance.$elem = $('<div class="st-block__diaporama"></div>');

        instance.mainSlider = new Slider({
            container: instance.$elem,
            contents: params.slides,
            controls: false,
            increment: 1,
            itemsPerSlide: 1
        });

        var thumbs = prepareThumbs(params.thumbs);

        instance.thumbSlider = new Slider({
            container: instance.$elem,
            contents: thumbs,
            controls: false,
            increment: 1,
            itemsPerSlide: 5
        });

        instance.thumbSlider.$elem.on('click', '[data-slide-index]', function(e) {
            var slideIndex = $(e.currentTarget).data('slideIndex');

            instance.mainSlider.goTo(slideIndex);
        });

        setTimeout(function() {
            instance.mainSlider.refreshDimensions();
            instance.thumbSlider.refreshDimensions();
        }, 0);

        return instance;
    }
};
