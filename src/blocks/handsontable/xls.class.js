import eventablejs from 'eventablejs';
import randomID from 'random-id';

import $        from 'etudiant-mod-dom';
import MdlModal from 'etudiant-mod-modal';

const template = `
<div class="hot-import-xls">
    <textarea class="st-textarea st-xls-field" placeholder="${ i18n.t('blocks:table:pasteXLS') }"></textarea>
</div>
`;

const REG_NEWLINE = /\r\n|\n|\r/;
const REG_TAB = /\t/;

const SELECTORS = {
    field: 'textarea.st-xls-field'
};

function constructor() {
    this.mdlModal = MdlModal.create({
        slug: randomID(),
        animation: 'fade',
        theme: 'pandora'
    });

    this.mdlModal.render({
        header: i18n.t('blocks:table:importXLS'),
        content: template,
        footer: {
            ok: 'Valider'
        }
    });

    this.$elem = this.mdlModal.$elem.find('.hot-import-xls');
    this.$field = this.$elem.find(SELECTORS.field);

    this.mdlModal.on('shown', () => this.$field.focus());
    this.mdlModal.$elem.on('click', '[data-mdl-ok]', () => this.sendData());
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
