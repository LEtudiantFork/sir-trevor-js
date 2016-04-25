import { debounce } from '../../lodash.js';

import * as EVENTS from '../events';

import {
    dataKeyIsUnique,
    headerValueIsUnique
} from './lib.js';

const AXIS = {
    'prop-axis': 'propKey',
    'value-axis': 'valueKey',
    'pie': 'valueKey'
};

const HEADERS = {
    'ref-header': 'refKey',
    'prop-header': 'propKey'
};

const DEBOUNCE = 500;

export default {
    registerClickListeners() {
        if (this.hasRegisteredClick) {
            return false;
        }

        this.hasRegisteredClick = true;

        this.$elem.on('click', 'button[data-action="add-prop"]', () => this.addProp());
        this.$elem.on('click', 'button[data-action="add-ref"]', () => this.addRef());
        this.$elem.on('click', 'button[data-action="delete-prop"]', e => this.deleteProp(e.currentTarget.dataset.key));
        this.$elem.on('click', 'button[data-action="delete-ref"]', e => this.deleteRef(e.currentTarget.dataset.key));
    },

    registerInputListeners() {
        if (this.hasRegisteredKeyUp) {
            return false;
        }

        this.hasRegisteredKeyUp = true;

        this.$elem.on('input', 'input[data-type="prop-header"], input[data-type="ref-header"]', debounce(e => {
            const input = e.currentTarget;
            const { type, oldValue } = input.dataset;
            const newValue = input.value.trim();
            const key = this[HEADERS[type]];

            if (newValue === '') {
                return this.trigger(EVENTS.ERROR.EMPTY);
            }
            if (!headerValueIsUnique(newValue, key, this.data)) {
                input.value = oldValue;
                return this.trigger(EVENTS.ERROR.UNIQ);
            }

            this.updateHeader({
                key,
                oldValue,
                newValue
            });
        }, DEBOUNCE));

        this.$elem.on('input', 'input[data-type="prop-axis"], input[data-type="value-axis"], input[data-type="pie"]', debounce(e => {
            const input = e.currentTarget;
            const { type, oldValue } = input.dataset;
            const newValue = input.value.trim();

            if (newValue === '') {
                return this.trigger(EVENTS.ERROR.EMPTY);
            }
            if (!dataKeyIsUnique(newValue, this.data)) {
                input.value = oldValue;
                return this.trigger(EVENTS.ERROR.UNIQ);
            }

            this.updateKey({
                type: AXIS[type],
                oldValue,
                newValue
            });
            input.dataset.oldValue = newValue;
        }, DEBOUNCE));

        this.$elem.on('input', 'input[data-type="color"]', debounce(e => {
            const input = e.currentTarget;
            const { prop, ref } = input.dataset;
            const newValue = input.value.trim();

            this.updateColor({
                prop,
                ref,
                newValue
            });
            input.dataset.oldValue = newValue;
        }, DEBOUNCE));

        this.$elem.on('input', 'input[data-type="number"]', debounce(e => {
            const input = e.currentTarget;
            const { oldValue, prop, ref } = input.dataset;
            const rawValue = input.value.trim();
            const newValue = parseFloat(rawValue.replace(',', '.'));

            if (rawValue === '') {
                return this.trigger(EVENTS.ERROR.EMPTY);
            }
            if (isNaN(newValue)) {
                input.value = oldValue;
                return this.trigger(EVENTS.ERROR.NUMBER);
            }

            this.updateCell({
                prop,
                ref,
                newValue
            });
            this.trigger(EVENTS.UPDATE.DATA);
            input.value = newValue;
            input.dataset.oldValue = newValue;
        }, DEBOUNCE));
    },

    getData() {
        return this.data;
    },

    getColors() {
        return this.colors;
    },

    updateKey({ type, oldValue, newValue }) {
        this[type] = newValue;

        this.trigger(EVENTS.UPDATE.KEY, {
            type,
            value: this[type]
        });

        this.data.forEach(item => {
            item[newValue] = item[oldValue];

            delete item[oldValue];
        });

        this.trigger(EVENTS.UPDATE.DATA);
        this.render();
    },

    updateColor({ ref, newValue }) {
        this.colors.forEach(item => {
            if (item[this.refKey] === ref) {
                item.color = newValue;
            }
        });

        this.trigger(EVENTS.UPDATE.COLOR);
    },

    updateHeader({ key, oldValue, newValue }) {
        if (key === this.refKey) {
            this.colors.forEach(item => {
                if (item[this.refKey] === oldValue) {
                    item[this.refKey] = newValue;
                }
            });
        }

        this.data.forEach(item => {
            if (item[key] === oldValue) {
                item[key] = newValue;
            }
        });

        this.trigger(EVENTS.UPDATE.DATA);
        this.render();
    }
};
