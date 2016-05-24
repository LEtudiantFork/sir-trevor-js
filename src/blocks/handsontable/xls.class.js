import eventablejs from 'eventablejs';
import randomID from 'random-id';

import $           from 'etudiant-mod-dom';
import Modal       from 'etudiant-mod-modal';

const template = `
<div class="hot-import-xls">
    <textarea class="st-xls-field" placeholder="${ i18n.t('blocks:table:pasteXLS') }"></textarea>
</div>
`;

const REG_NEWLINE = /\r\n|\n|\r/;
const REG_TAB = /\t/;

const SELECTORS = {
    field: 'textarea.st-xls-field'
};

function constructor() {
    this.$elem = $(template);
    this.$field = this.$elem.find(SELECTORS.field);

    this.modal = Modal.create({
        slug: randomID(),
        animation: 'fade',
        theme: 'pandora'
    });

    this.modal.render({
        header: i18n.t('blocks:table:importXLS'),
        content: '',
        footer: {
            ok: 'Valider'
        }
    });

    this.modal.appendToContentArea(this.$elem);

    this.modal.on('shown', () => this.$field.focus());
    this.modal.$elem.on('click', '[data-mdl-ok]', () => this.sendData());
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
        },

        sendData() {
            const rawData = this.$field.val().trim();
            if (rawData) {
                const data = rawData.split(REG_NEWLINE).map(a => a.split(REG_TAB));
                this.trigger('import:xsl', data);
                this.$field.val('');
            }
        }
    }
};
