var _             = require('../../../lodash.js');
var $             = require('jquery');
var EventBus      = require('../../../event-bus.js');
var fieldHelper   = require('../../../helpers/field.js');

var smallTemplate = [
    '<figure class="st-sub-block-image" data-etu-zoom="">',
        '<img src="<%= thumbnail %>" />',
    '</figure>',
    '<%= formatField %>',
    '<span>légende : <%= legend %></span>',
    '<span>&copy; <%= copyright %></span>'
].join('\n');

var largeTemplate = [
    '<figure class="st-sub-block-image">',
        '<img src="<%= thumbnail %>" />',
    '</figure>',
    '<%= formatsField %>',
    '<%= legendField %>',
    '<%= linkField %>',
    '<%= alignField %>',
    '<span>&copy; <%= copyright %></span>'
].join('\n');

var inBlockTemplate = [
    '<%= img %>',
    '<figcaption><%= legend %></figcaption>',
    '<div class="st-sub-block-dynamic-image-edit-area">',
        '<button type="button" data-edit class="st-icon" data-icon="image"></button>',
        '<button type="button" data-delete class="st-icon" data-icon="bin"></button>',
    '</div>'
].join('\n');

function hasFormatString(formatString, formats) {
    return formats.some(function(formatItem) {
        return formatItem.label === formatString;
    });
}

function init() {
    this.smallTemplate = smallTemplate;
    this.largeTemplate = largeTemplate;

    this.content.align = this.content.align || 'right';

    if (this.content.formats.length === 1) {
        this.content.activeFormat = this.content.formats[0];
    }
}

var dynamicImagePrototype = {

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
        var formatField = '';

        if (this.content.formats.length > 1) {
            var formats = this.content.formats.map(function(formatItem) {
                return {
                    value: formatItem.label,
                    label: formatItem.label
                };
            });

            formatField = fieldHelper.build({
                type: 'select',
                placeholder: 'Sélectionnez un format',
                name: 'format-' + this.id,
                options: formats
            });
        }

        var toRender = Object.assign({}, this.content, {
            formatField: formatField
        });

        return _.template(smallTemplate, toRender, { imports: { '_': _ } });
    },

    postRenderSmall: function() {
        if (!this.hasRenderedSmall) {
            this.hasRenderedSmall = true;

            this.$elem.on('click', 'select', function(e) {
                if (this.renderedAs === 'small') {
                    e.stopPropagation();
                }
            }.bind(this));

            this.$elem.on('change', 'select', function(e) {
                if (this.renderedAs === 'small') {
                    e.stopPropagation();

                    this.content.activeFormat = e.currentTarget.value;
                }
            }.bind(this));
        }
    },

    prepareLargeMarkup: function() {
        var formatOptions = this.content.formats.map(function(formatItem) {
            return {
                value: formatItem.label,
                label: formatItem.label,
                selected: this.content.activeFormat === formatItem.label
            };
        }.bind(this));

        var alignField = fieldHelper.build({
            type: 'select',
            name: 'align',
            label: 'Position',
            options: [
                {
                    value: 'left',
                    label: 'A gauche du texte',
                    selected: this.content.align === 'left' ? 'selected' : ''
                },
                {
                    value: 'right',
                    label: 'A droite du texte',
                    selected: this.content.align === 'right' ? 'selected' : ''
                }
            ]
        });

        var formatsField = fieldHelper.build({
            type: 'select',
            label: 'Format',
            name: 'format',
            options: formatOptions
        });

        var legendField = fieldHelper.build({
            type: 'text',
            name: 'link',
            label: 'Legend',
            value: this.content.legend
        });

        var linkField = '';

        if (this.content.link) {
            linkField = fieldHelper.build({
                type: 'text',
                name: 'link',
                label: 'Link',
                value: this.content.link
            });
        }

        var toRender = Object.assign({}, this.content, {
            alignField: alignField,
            formatsField: formatsField,
            legendField: legendField,
            linkField: linkField,
            hasLink: this.content.link === '' ? this.content.link : 'entrez un lien'
        });

        return _.template(largeTemplate, toRender, { imports: { '_': _ } });
    },

    postRenderLarge: function() {
        if (!this.hasRenderedLarge) {
            this.hasRenderedLarge = true;

            this.$elem.on('change', 'select[name="align"]', function(e) {
                this.content.align = e.currentTarget.value;
            }.bind(this));

            this.$elem.on('change', 'select[name="format"]', function(e) {
                this.content.activeFormat = e.currentTarget.value;
            }.bind(this));

            this.$elem.on('keyup', 'input[name="legend"]', function(e) {
                this.content.legend = e.currentTarget.value;
            }.bind(this));

            this.$elem.on('keyup', 'input[name="link"]', function(e) {
                this.content.link = e.currentTarget.value;
            }.bind(this));

        }
    },

    // unlike renderSmall/Large this makes a new element every time
    renderInBlock: function() {
        var $elem = $('<figure contenteditable="false" data-sub-block-in-block="' + this.id + '"></figure>');

        $elem.on('click', 'button[data-edit]', function() {
            EventBus.trigger('editImage', this);
        }.bind(this));

        $elem.on('click', 'button[data-delete]', function() {
            if (confirm('Supprimez cette image ?')) {
                $elem.remove();
                $elem = null;
            }
        });

        $elem.addClass('st-sub-block-align-' + this.content.align);

        var img;

        if (this.content.link && this.content.link !== '') {
            img = [
                    '<a href="' + this.content.link + '" target="_blank">',
                      '<img src="' + this.getFormattedSrc(this.content.activeFormat) + '" />',
                    '</a>'
                   ].join('\n');
        }
        else {
            img = '<img src="' + this.getFormattedSrc(this.content.activeFormat) + '" />';
        }

        $elem.html(
            _.template(inBlockTemplate, {
                legend: this.content.legend,
                img: img
            })
        );

        return $elem.get(0);
    },

    getHTMLPlaceholder: function() {
        var elem = document.createElement('div');

        $(elem).attr('data-sub-block-in-block', this.id);

        return elem.outerHTML;
    },

    replaceRenderedInBlock: function() {
        $('[data-sub-block-in-block="' + this.id + '"]').replaceWith(this.renderInBlock());
    }
};

module.exports = {
    init: init,
    prototype: dynamicImagePrototype
};
