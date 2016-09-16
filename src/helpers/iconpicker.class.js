import eventablejs from 'eventablejs';
import randomID from 'random-id';

import Icon    from './icon.class.js';

import $        from 'etudiant-mod-dom';
import MdlModal from 'etudiant-mod-modal';
import IcoIcon  from 'etudiant-mod-icon';

const attrIcon = 'data-icon-name';

function constructor() {
    this.$elem = $('<div class="st-icon-picker-container"></div>');

    this.mdlModal = MdlModal.create({
        slug: randomID(),
        animation: 'fade',
        theme: 'pandora',
        cssClasses: 'st-icon-picker-modal'
    });

    IcoIcon.getSprite()
    .then((spriteStr) => {
        let rx = /symbol id="icon-(.*)" viewBox/gim;

        let icons = '';
        let match;
        while (match = rx.exec(spriteStr)) {
            const icon = Icon.create(match[1]);

            icons += icon.$elem;
        }

        this.$elem.append(icons);

        this.mdlModal.render({
            header: 'Choisissez un icône',
            content: this.$elem[0].outerHTML
        });

        this.$elem.on('click', `[${attrIcon}]`, (e) => {
            this.trigger('selected', $(e.currentTarget).attr(attrIcon));
        });
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
