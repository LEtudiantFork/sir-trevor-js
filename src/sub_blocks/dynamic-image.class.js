var _             = require('../lodash.js');
var $             = require('jquery');
var BasicSubBlock = require('./basic.class.js');
var fieldBuilder  = require('../helpers/field-builder.js');

var smallTemplate = [
    '<figure class="st-sub-block-image" data-etu-zoom="">',
        '<img src="<%= thumbnail %>" />',
    '</figure>',
    '<%= select %>',
    '<span>légende : <%= legend %></span>',
    '<span>&copy; <%= copyright %></span>'
].join('\n');

var largeTemplate = ['large template here'].join('\n');

var inBlockTemplate = [].join('\n');

function hasFormatString(formatString, formats) {
    return formats.some(function(formatItem) {
        return formatItem.label === formatString;
    });
}

var DynamicImage = function() {
    BasicSubBlock.prototype.init.apply(this, arguments);

    this.init();
};

DynamicImage.prototype = Object.create(BasicSubBlock.prototype);

DynamicImage.prototype.constructor = BasicSubBlock;

var prototype = {

    init: function() {
        this.content.thumbnail = this.getFormattedSrc('100x100');

        this.smallTemplate = smallTemplate;
        this.largeTemplate = largeTemplate;
        this.inBlockTemplate = inBlockTemplate;

        if (this.content.formats.length === 1) {
            this.activeFormat = this.content.formats[0];
        }

        this.$elem.on('click', function() {
            alert('YYAAAY');
        });
    },

    getFormattedSrc: function(formatString) {
        if (hasFormatString(formatString, this.content.formats)) {
            return this.content.file.replace('original', formatString);
        }

        return this.content.file;
    },

    prepareSmallMarkup: function() {
        var select = '';

        if (this.content.formats.length > 1) {
            select = fieldBuilder({
                type: 'select',
                placeholder: 'Sélectionnez un format',
                name: 'format-' + this.id,
                options: this.content.formats
            });
        }

        var toRender = Object.assign({}, this.content, {
            select: select
        });

        return _.template(smallTemplate, toRender, { imports: { '_' : _ } });
    },

    prepareLargeMarkup: function() {
        return _.template(largeTemplate, this.content, { imports: { '_' : _ } });
    }

    // renderInBlock: function() {
    //     return _.template(largeTemplate, this.content, { imports: { '_' : _ } });
    // }
};

DynamicImage.prototype = Object.assign(DynamicImage.prototype, prototype);

module.exports = DynamicImage;
