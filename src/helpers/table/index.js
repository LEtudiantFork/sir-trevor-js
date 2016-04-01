import $           from 'etudiant-mod-dom';
import eventablejs from 'eventablejs';

import prototype from './generic.js';
import oneDimensionalTablePrototype from './one-dimensional.js';
import twoDimensionalTablePrototype from './two-dimensional.js';

module.exports = {
    create(options) {
        var instance;

        if (options.tableType === '1D') {
            function OneDimensionalTable() {}

            instance = new OneDimensionalTable();

            instance = Object.assign(instance, prototype, oneDimensionalTablePrototype, eventablejs, options);
        }
        else if (options.tableType === '2D') {
            function TwoDimensionalTable() {}

            instance = new TwoDimensionalTable();

            instance = Object.assign(instance, prototype, twoDimensionalTablePrototype, eventablejs, options);
        }

        instance.$elem = $('<div class="st-table"></div>');

        instance.registerKeyUpListeners();
        instance.registerClickListeners();

        instance.render();

        return instance;
    }
};
