// @todo replace with etudiant-mod-carousel

import $ from 'etudiant-mod-dom';
import eventablejs from 'eventablejs';
import Slider from './slider.class';

function prepareThumbs(thumbs) {
    return thumbs.map(function(thumb, index) {
        var wrapper = $('<div></div>');

        wrapper.attr('data-slide-index', index);

        wrapper.append(thumb);

        return wrapper;
    });
}

var diaporamaPrototype = {};

export default {
    create(params) {
        const instance = Object.assign({}, eventablejs, diaporamaPrototype);

        instance.$elem = $('<div class="st-block__diaporama"></div>');

        instance.mainSlider = Slider.create({
            container: instance.$elem,
            contents: params.slides,
            controls: false,
            increment: 1,
            itemsPerSlide: 1
        });

        const thumbs = prepareThumbs(params.thumbs);

        instance.thumbSlider = Slider.create({
            container: instance.$elem,
            contents: thumbs,
            controls: false,
            increment: 1,
            itemsPerSlide: 5
        });

        instance.thumbSlider.$elem.on('click', '[data-slide-index]', e => {
            var slideIndex = $(e.currentTarget).data('slideIndex');

            instance.mainSlider.goTo(slideIndex);
        });

        setTimeout(() => {
            instance.mainSlider.refreshDimensions();
            instance.thumbSlider.refreshDimensions();
        }, 0);

        return instance;
    }
};
