import eventablejs from 'eventablejs';
import randomID from 'random-id';

import $           from 'etudiant-mod-dom';
import Modal       from 'etudiant-mod-modal';

import { get as getFilters } from './filters';
import { API_URL, parse as parseFilters, getConfig } from './filters-media';

function constructor({ apiUrl, type, accessToken, application }) {
    this.$elem = $('<div class="st-media-picker-container"></div>');

    this.pandoraSearch = getFilters({
        url: `${ apiUrl }${ API_URL }${ application }`,
        filtersUrl: `${ apiUrl }/edt/media`,
        accessToken,
        application,
        container: this.$elem,
        type,
        callback: data => parseFilters(data).categories,
        getConfig
    });

    this.pandoraSearch.on('selected', ({ content }) => {
        this.trigger('selected', content);
        this.close();
    });

    this.modal = Modal.create({
        slug: randomID(),
        animation: 'fade',
        theme: 'pandora',
        cssClasses: 'st-media-modal'
    });

    this.modal.render({
        header: i18n.t('blocks:illustrated:pickIcon'),
        content: ''
    });

    this.modal.appendToContentArea(this.$elem);
}

export default {
    create(...args) {
        const instance = Object.assign({}, eventablejs, this.prototype);

        constructor.apply(instance, args);

        return instance;
    },

    prototype: {
        open() {
            this.modal.show();
            this.pandoraSearch.slider.refreshDimensions();
        },

        close() {
            this.modal.hide();
        },

        destroy() {
            this.$elem.remove();
            this.pandoraSearch.destroy();
            this.modal.destroy();
            this.$elem = null;
            this.pandoraSearch = null;
            this.modal = null;
        }
    }
};
