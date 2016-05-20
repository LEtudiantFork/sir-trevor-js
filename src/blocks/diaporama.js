/*
    Diaporama Block
*/
import xhr from 'etudiant-mod-xhr';
import $ from 'etudiant-mod-dom';
import CarCarousel from 'etudiant-mod-carousel';

import config from '../config';
import Block  from '../block';

const API_URL = '/edt/media/';

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

const thumbSlide = image => `
    <img class="st-block-img" src="${ image.thumbnail }" width="80" height="80" />
`;

export default Block.extend({

    type: 'diaporama',

    title: () => i18n.t('blocks:diaporama:title'),

    editorHTML,

    'icon_name': 'Diaporama',

    toolbarEnabled: false,

    loadData({ id, legend = '' }) {
        this.$('.st-block-legend')[0].innerHTML = legend;
        this.$elem = $(this.$('.st-block--diaporama')[0]);

        xhr.get(`${ this.globalConfig.apiUrl }${ API_URL }${ id }`, {
            data: { 'access_token': this.globalConfig.accessToken }
        })
        .then(({ content: { images = [] } = {} }) => {
            const mainCarousel = carousel({
                id,
                slides: images.map(image => mainSlide(image))
            });

            const thumbCarousel = carousel({
                parentId: id,
                slides: images.map(image => thumbSlide(image))
            });

            this.$elem.append(mainCarousel);
            this.$elem.append(thumbCarousel);

            setTimeout(() => CarCarousel.initViaDOM(this.$elem), 10); // lory can't handle the speeeeeed (loading images)
        });
    }
});
