var _             = require('../lodash.js');
var $             = require('jquery');
var BasicSubBlock = require('./basic.class.js');
var fieldHelper   = require('../helpers/field.js');

var smallTemplate = [
    '<figure class="st-sub-block-image" data-etu-zoom="">',
        '<img src="<%= thumbnail %>" />',
    '</figure>',
    '<%= select %>',
    '<span>légende : <%= legend %></span>',
    '<span>&copy; <%= copyright %></span>'
].join('\n');

var largeTemplate = [
    '<figure class="st-sub-block-image" data-etu-zoom="">',
        '<img src="<%= thumbnail %>" />',
    '</figure>',
    '<span>Format : <%= activeFormat %></span>',
    '<span>&copy; <%= copyright %></span>',
    '<span>légende :</span>',
    '<input type="text" name="legend" value="<%= legend %>" />',
    '<span>url :</span>',
    '<input type="url" name="link" value="" placeholder="entrez un lien" />',
    '<span>Position :</span>',
    '<select name="position">',
        '<option value="left">A gauche du texte</option>',
        '<option value="right">A droite du texte</option>',
    '</select>'
].join('\n');

var inBlockTemplate = [
    '<figure class="st-sub-block-image" data-etu-zoom="">',
        '<img src="<%= thumbnail %>" />',
    '</figure>',
    '<button>éditer</button>',
    '<button>supprimer</button>'
].join('\n');

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
        // @todo remove once lamine has done this
        this.content.thumbnail = this.getFormattedSrc('100x100');

        this.smallTemplate = smallTemplate;
        this.largeTemplate = largeTemplate;
        this.inBlockTemplate = inBlockTemplate;

        this.position = 'right';

        if (this.content.formats.length === 1) {
            this.activeFormat = this.content.formats[0];
        }
    },

    getData: function() {
        return { prop: 'hi there kids' };
    },

    getFormattedSrc: function(formatString) {
        if (hasFormatString(formatString, this.content.formats)) {
            return this.content.file.replace('original', formatString);
        }

        return this.content.file;
    },

    prepareSmallMarkup: function() {
        var select = '';

        if (this.content.formats.length > 1) {
            select = fieldHelper.build({
                type: 'select',
                placeholder: 'Sélectionnez un format',
                name: 'format-' + this.id,
                options: this.content.formats
            });
        }

        var toRender = Object.assign({}, this.content, {
            select: select
        });

        return _.template(smallTemplate, toRender, { imports: { '_': _ } });
    },

    postRenderSmall: function() {
        if (!this.hasRenderedSmall) {
            this.hasRenderedSmall = true;

            this.$elem.on('click', 'select', function(e) {
                if (this.renderedAs === 'small') {
                    e.stopPropagation();

                    // change active image (and thus zoomable behaviour) on select
                }
            }.bind(this));
        }
    },

    prepareLargeMarkup: function() {
        var toRender = Object.assign({}, this.content, {
            activeFormat: this.activeFormat
        });

        return _.template(largeTemplate, toRender, { imports: { '_': _ } });
    },

    postRenderLarge: function() {
        if (!this.hasRenderedLarge) {
            this.hasRenderedLarge = true;

            this.$elem.on('change', 'select[name="position"]', function(e) {
                this.position = e.currentTarget.value;
            }.bind(this));
        }
    },

    renderInBlock: function() {
        var elem = document.createElement('div');

        elem.innerHTML = '\[ this is an image in the text \]';

        return $(elem);
        // return _.template(largeTemplate, this.content, { imports: { '_' : _ } });
    }
};

Object.assign(DynamicImage.prototype, prototype);

module.exports = DynamicImage;
