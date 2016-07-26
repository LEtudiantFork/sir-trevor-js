import eventablejs from 'eventablejs';
import randomID from 'random-id';

import Icon    from './icon.class.js';

import $        from 'etudiant-mod-dom';
import MdlModal from 'etudiant-mod-modal';
import IcoIcon  from 'etudiant-mod-icon';

const attrIcon = 'data-icon-name';

function constructor() {
    this.$elem = $('<div class="st-icon-picker-container"></div>');

    IcoIcon.getSprite()
    .then((spriteStr) => {
        var rx = /symbol id="icon-(.*)" viewBox/gim;

        var icons = '';
        var match;
        while (match = rx.exec(spriteStr)){
            const icon = Icon.create(match[1]);

            icons += icon.$elem;
        }

        this.$elem.append(icons);

        this.$elem.on('click', `[${attrIcon}]`, (e) => {
            this.trigger('selected', $(e.currentTarget).attr(attrIcon));
        });
    });

    this.mdlModal = MdlModal.create({
        slug: randomID(),
        animation: 'fade',
        theme: 'pandora',
        cssClasses: 'st-icon-picker-modal'
    });

    this.mdlModal.render({
        header: 'Choisissez un icône',
        content: ''
    });

    this.mdlModal.appendToContentArea(this.$elem);
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
        },

        close() {
            this.mdlModal.hide();
        },

        destroy() {
            this.$elem.remove();
            this.$elem = null;
            this.mdlModal.destroy();
        }
    }
};
