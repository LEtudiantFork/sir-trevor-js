import $ from 'etudiant-mod-dom';
import CarCarousel from 'etudiant-mod-carousel';

import config from '../config';
import Block  from '../block';

const editorHTML = `
    <div class="st-block--diaporama">
        <h4 class="st-block-legend"></h4>
    </div>
`;

const carousel = data => `
    <div class="c-carousel ${ data.parentId ? 'c-carousel--thumbnails' : ''}"
        data-car-carousel="${ data.parentId ? `${ data.parentId }-thumb` : data.id }"
        data-car-rewind
        ${ data.parentId ? `
        data-car-thumbnails="${ data.parentId }"
        data-car-slides="3"
        ` : '' }>
        <div class="c-carousel__frame">
            <div class="c-carousel__slides">
                ${ data.slides.reduce((prev, slide) => `
                    ${ prev }
                    <div class="c-carousel__slide">${ slide }</div>
                `, '') }
            </div>
        </div>
        <span class="c-carousel__nav c-carousel__nav--prev">
            <svg class="st-icon c-icon-svg"><use xlink:href="${ config.defaults.iconUrl }#icon-chevron-left-thin" /></svg>
        </span>
        <span class="c-carousel__nav c-carousel__nav--next">
            <svg class="st-icon c-icon-svg"><use xlink:href="${ config.defaults.iconUrl }#icon-chevron-right-thin" />></svg>
        </span>
    </div>
`;

const mainSlide = image => `
    <figure>
        <img class="st-block-img" src="${ image.file }" width="700" height="400" />
        <figcaption>
            <strong>${ image.title || ''}</strong><br/>
            ${ image.description || ''}
            <em>${ image.copyright || '' }</em>
        </figcaption>
    </figure>
`;

module.exports = Block.extend({

    type: 'diaporama',

    toolbarEnabled: false,

    title: () => i18n.t('blocks:diaporama:title'),

    icon_name: 'Diaporama',

    editorHTML,

    loadData({ id, legend = '', images = [] }) {
        this.$('.st-block-legend')[0].innerHTML = legend;
        this.$elem = $(this.$('.st-block--diaporama')[0]);
        this.$elem.append(carousel({
            id,
            slides: images.map(image => mainSlide(image))
        }));
        this.$elem.append(carousel({
            parentId: id,
            slides: images.map(image => `<img class="st-block-img" src="${ image.thumbnail }" width="80" height="80" />`)
        }));

        setTimeout(() => CarCarousel.initViaDOM(this.$elem), 10); // lory can't handle the speeeeeed
    }
});
