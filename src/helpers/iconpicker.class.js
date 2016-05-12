import $           from 'etudiant-mod-dom';
import eventablejs from 'eventablejs';
import Icon        from './icon.class.js';
import Modal       from 'etudiant-mod-modal';

const MOCK = {
    content: [
        {
            src: 'inc/icons/bullhorn.svg',
            name: 'bullhorn'
        },
        {
            src: 'inc/icons/camera.svg',
            name: 'camera'
        },
        {
            src: 'inc/icons/headphones.svg',
            name: 'headphones'
        },
        {
            src: 'inc/icons/pacman.svg',
            name: 'pacman'
        },
        {
            src: 'inc/icons/video-camera.svg',
            name: 'video-camera'
        }
    ]
};

function constructor(iconsData = MOCK.content) {
    this.$elem = $('<div class="st-icon-picker-container"></div>');

    this.icons = iconsData.map(iconDataItem => {
        const icon = Icon.create(iconDataItem);
        this.$elem.append(icon.$elem);

        return icon;
    });

    this.$elem.on('click', 'div.st-illustrated-icon', e => this.select(e.currentTarget.dataset.iconName));

    this.modal = Modal.create({
        slug: 'icons-picker',
        animation: 'fade',
        theme: 'pandora'
    });

    this.modal.render({
        header: i18n.t('blocks:illustrated:pickIcon'),
        content: '',
        footer: {
            ok: 'OK'
        }
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
        },

        close() {
            this.modal.hide();
        },

        destroy() {
            this.modal.destroy();
            this.$elem.remove();
            this.$elem = null;
        },

        select(name) {
            this.trigger('selected', this.getIconById(name));
        },

        getIconById(name) {
            return this.icons.filter(icon => icon.name.toString() === name.toString())[0];
        }
    }
};
