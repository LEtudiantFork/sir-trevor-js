import eventablejs from 'eventablejs';
import randomID from 'random-id';

import Icon    from './icon.class.js';

import $       from 'etudiant-mod-dom';
import Modal   from 'etudiant-mod-modal';
import IcoIcon from 'etudiant-mod-icon';

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

    this.modal = Modal.create({
        slug: randomID(),
        animation: 'fade',
        theme: 'pandora',
        cssClasses: 'st-icon-picker-modal'
    });

    this.modal.render({
        header: 'Choisissez un icône',
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
        },

        close() {
            this.modal.hide();
        },

        destroy() {
            this.$elem.remove();
            this.$elem = null;
            this.modal.destroy();
        }
    }
};
