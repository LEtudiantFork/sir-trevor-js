var $           = require('jquery');
var eventablejs = require('eventablejs');
var _           = require('../lodash.js');

var tableTemplate = '<table class="color-picker"><%= content %></table>';

var rowTemplate = '<tr><%= cells %></tr>';

var cellTemplate = '<td data-color="<%= color %>" bgcolor="<%= color %>"></td>';

function createColorPickerRow(colorPickerRowData) {
    var cellMarkup = '';

    colorPickerRowData.forEach(function(color) {
        cellMarkup += _.template(cellTemplate, {
            color: color
        });
    });

    return _.template(rowTemplate, {
        cells: cellMarkup
    });
}

function createColorPickerElement(colorPickerData) {
    var colorPickerRows = '';

    Object.keys(colorPickerData).forEach(function(colorPickerDataKey) {
        colorPickerRows += createColorPickerRow(colorPickerData[colorPickerDataKey]);
    });

    var table = _.template(tableTemplate, {
        content: colorPickerRows
    });

    return $(table);
}

function clickWatcher(colorPicker) {
    colorPicker.$elem.on('click', 'td', function(){
        var color = $(this).data('color');

        colorPicker.toggleVisible();

        colorPicker.trigger('color:change', color);
    });
}

var ColorPicker = function(colorPickerConfig) {
    this.block = colorPickerConfig.block;

    this.$elem = createColorPickerElement(colorPickerConfig.colors);

    this.$elem.appendTo(this.block.$control_ui);

    clickWatcher(this);
};

var prototype = {
    toggleVisible: function() {
        this.$elem.toggleClass('is-visible');
    }
};

ColorPicker.prototype = Object.assign({}, prototype, eventablejs);

module.exports = ColorPicker;
