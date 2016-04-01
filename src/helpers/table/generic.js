import $ from 'etudiant-mod-dom';
import { dataKeyIsUnique, headerValueIsUnique } from './lib.js';

export default {
    registerClickListeners() {
        if (this.hasRegisteredClick) {
            return false;
        }

        this.hasRegisteredClick = true;

        this.$elem.on('click', 'button[data-action="add-row"]', () => this.addRow());
        this.$elem.on('click', 'button[data-action="add-column"]', () => this.addColumn());
        this.$elem.on('click', 'button[data-action="delete-row"]', e => this.deleteRow($(e.currentTarget).data('key')));
        this.$elem.on('click', 'button[data-action="delete-column"]', e => this.deleteColumn($(e.currentTarget).data('key')));
    },

    updateDataKey({ type, oldKey, newKey }) {
        if (dataKeyIsUnique(newKey, this.tableData)) {

            this[type] = newKey;

            this.trigger('update:key', {
                type: type,
                value: this[type]
            });

            this.tableData.forEach(item => {
                item[newKey] = item[oldKey];

                delete item[oldKey];
            });

            this.trigger('update', this.tableData);
            this.render();
        }
        else {
            this.trigger('error', 'unique');
        }
    },

    updateHeader({ key, oldValue, newValue }) {
        if (!headerValueIsUnique(newValue, key, this.tableData)) {
            this.trigger('error', 'unique');
        }
        else if (newValue === '') {
            this.trigger('error', 'empty');
        }
        else {
            this.tableData.forEach(item => {
                if (item[key] === oldValue) {
                    item[key] = newValue;
                }
            });

            this.trigger('update', this.tableData);
        }

        this.render();
    }
};
