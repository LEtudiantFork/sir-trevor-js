import eventablejs from 'eventablejs';
import randomID from 'random-id';

import MdlModal from 'etudiant-mod-modal';

import { get as getFilters } from './filters';
import { API_URL, parse as parseFilters, getConfig } from './filters-media';

const template = '<div class="st-media-picker-container"></div>';

function constructor({ apiUrl, type, accessToken, application, miniature }) {
    this.mdlModal = MdlModal.create({
        slug: randomID(),
        animation: 'fade',
        theme: 'pandora',
        cssClasses: 'st-media-modal'
    });

    this.mdlModal.render({
        header: i18n.t('blocks:illustrated:pickIcon'),
        content: template
    });

    this.$elem = this.mdlModal.$elem.find('.st-media-picker-container');
    this.pandoraSearch = getFilters({
        url: `${ apiUrl }${ API_URL }${ application }`,
        filtersUrl: `${ apiUrl }/edt/media`,
        accessToken,
        application,
        container: this.$elem,
        type,
        miniature,
        callback(data) {
            let { categories = [] } = parseFilters(data);
            return categories;
        },
        getConfig
    });

    this.pandoraSearch.on('selected', ({ content }) => {
        this.trigger('selected', content);
        this.close();
    });
}

export default {
    create(...args) {
        const instance = Object.assign({}, eventablejs, this.prototype);

        constructor.apply(instance, args);

        return instance;
    },

    prototype: {
        open() {
            this.mdlModal.show();
            this.pandoraSearch.slider.refreshDimensions();
        },

        close() {
            this.mdlModal.hide();
        },

        destroy() {
            this.$elem.remove();
            this.pandoraSearch.destroy();
            this.mdlModal.destroy();
            this.$elem = null;
            this.pandoraSearch = null;
            this.mdlModal = null;
        }
    }
};
