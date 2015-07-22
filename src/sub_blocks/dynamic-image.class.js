var _             = require('../lodash.js');
var $             = require('jquery');
var BasicSubBlock = require('./basic.class.js');
var fieldBuilder  = require('../helpers/field-builder.js');

var smallTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-small st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image" data-etu-zoom="">',
            '<img src="<%= thumbnail %>" />',
        '</figure>',
        '<%= select %>',
        '<span>légende : <%= legend %></span>',
        '<span>&copy; <%= copyright %></span>',
    '</div>'
].join('\n');

var largeTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-large st-sub-block__<%= type %>">',
    '</div>'
].join('\n');

var inBlockTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-large st-sub-block__<%= type %>">',
    '</div>'
].join('\n');

function hasFormatString(formatString, formats) {
    return formats.some(function(formatItem) {
        return formatItem.label === formatString;
    });
}

var DynamicImage = function() {
    this.init.apply(this, arguments);
};

DynamicImage.prototype = {

    init: function(contents) {
        this.id = contents.id;

        this.contents = contents;
        this.contents.type = 'dynamic-image';

        this.contents.thumbnail = this.getFormattedSrc('100x100');

        this.smallTemplate = smallTemplate;
        this.largeTemplate = largeTemplate;
        this.inBlockTemplate = inBlockTemplate;

        if (this.contents.formats.length === 1) {
            this.activeFormat = this.contents.formats[0];
        }
    },

    getFormattedSrc: function(formatString) {
        if (hasFormatString(formatString, this.contents.formats)) {
            return this.contents.file.replace('original', formatString);
        }

        return this.contents.file;
    },

    renderSmall: function() {
        var select = '';

        if (this.contents.formats.length > 1) {
            select = fieldBuilder({
                type: 'select',
                placeholder: 'Sélectionnez un format',
                name: 'format-' + this.id,
                options: this.contents.formats
            });
        }

        var toRender = Object.assign({}, this.contents, {
            select: select
        });

        return BasicSubBlock.prototype.renderSmall.call(this, toRender);
    },

    renderLarge: function() {
        return BasicSubBlock.prototype.renderLarge.call(this);
    },

    renderInBlock: function() {

    }
};

module.exports = DynamicImage;
