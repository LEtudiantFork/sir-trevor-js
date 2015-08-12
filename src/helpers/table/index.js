var $           = require('jquery');
var _           = require('../../lodash.js');
var eventablejs = require('eventablejs');

var genericTablePrototype = require('./generic.js');
var oneDimensionalTablePrototype = require('./one-dimensional.js');
var twoDimensionalTablePrototype = require('./two-dimensional.js');

module.exports = {
    create: function(options) {
        var instance;

        if (options.tableType === '1D') {
            function OneDimensionalTable() {}

            instance = new OneDimensionalTable();

            instance = Object.assign(instance, genericTablePrototype, oneDimensionalTablePrototype, eventablejs, options);
        }
        else if (options.tableType === '2D') {
            function TwoDimensionalTable() {}

            instance = new TwoDimensionalTable();

            instance = Object.assign(instance, genericTablePrototype, twoDimensionalTablePrototype, eventablejs, options);
        }

        instance.$elem = $('<div class="st-table"></div>');

        instance.registerKeyUpListeners();
        instance.registerClickListeners();

        instance.render();

        return instance;
    }
};
