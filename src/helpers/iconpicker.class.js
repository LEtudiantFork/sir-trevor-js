const $           = require('etudiant-mod-dom').default;
const eventablejs = require('eventablejs');
const Icon        = require('./icon.class.js');
const Modal       = require('etudiant-mod-modal').default;

const mockIconData = {
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

function getIconById(icons, name) {
    return icons.filter(icon => icon.name.toString() === name.toString())[0];
}

function constructor() {
    this.modal = Modal.create({
        slug: 'icons-picker',
        animation: 'fade',
        theme: 'pandora'
    });

    this.modal.render({
        header: 'Choisissez une icône',
        content: '',
        footer: {
            ok: 'OK'
        }
    });

    this.iconContainer = $('<div class="icon-picker-container"></div>');

    this.iconContainer.on('click', 'div.st-illustrated-icon', e => {
        this.trigger('selected', getIconById(this.icons, e.currentTarget.dataset.iconName));
    });

    this.modal.appendToContentArea(this.iconContainer);

    const iconData = mockIconData.content;

    this.icons = iconData.map(iconDataItem => {
        const icon = Icon.create(iconDataItem);
        this.iconContainer.append(icon.$elem);
        return icon;
    });

}

const prototype = {

    close() {
        this.modal.hide();
    },

    destroy() {
        this.modal.destroy();
    },

    open() {
        this.modal.show();
    }

};

module.exports = {
    create(params) {
        const instance = Object.assign({}, prototype, eventablejs, params);

        constructor.call(instance, params);

        return instance;
    }
};
