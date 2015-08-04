var _             = require('../lodash.js');
var $             = require('jquery');
var BasicSubBlock = require('./basic.class.js');
var EventBus      = require('../event-bus.js');
var fieldHelper   = require('../helpers/field.js');

var smallTemplate =
    `<figure class="st-sub-block-image" data-etu-zoom="">
        <img src="<%= thumbnail %>" />
    </figure>
    <%= select %>
    <span>légende : <%= legend %></span>
    <span>&copy; <%= copyright %></span>`;

var largeTemplate =
    `<figure class="st-sub-block-image" data-etu-zoom="">
        <img src="<%= thumbnail %>" />
    </figure>
    <span>Format :</span>
    <%= formats %>
    <span>&copy; <%= copyright %></span>
    <span>légende :</span>
    <input type="text" name="legend" value="<%= legend %>" />
    <span>url :</span>
    <input type="url" name="link" value="<%= link %>" placeholder="entrez un lien" />
    <span>Position :</span>
    <select name="align">
        <option <%= isLeft %> value="left">A gauche du texte</option>
        <option <%= isRight %> value="right">A droite du texte</option>
    </select>`;

var inBlockTemplate =
    `<%= img %>
    <span>légende : <%= legend %></span>
    <button data-edit>éditer</button>
    <button data-delete>supprimer</button>`;

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
        this.smallTemplate = smallTemplate;
        this.largeTemplate = largeTemplate;

        this.content.align = this.content.align || 'right';

        if (this.content.formats.length === 1) {
            this.content.activeFormat = this.content.formats[0];
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
            var formats = this.content.formats.map(function(formatItem) {
                return {
                    value: formatItem.label,
                    label: formatItem.label
                };
            });

            select = fieldHelper.build({
                type: 'select',
                placeholder: 'Sélectionnez un format',
                name: 'format-' + this.id,
                options: formats
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

        var formats = fieldHelper.build({
            type: 'select',
            name: 'format',
            options: formatOptions
        });

        var toRender = Object.assign({}, this.content, {
            formats: formats,
            isLeft: this.content.align === 'left' ? 'selected' : '',
            isRight: this.content.align === 'right' ? 'selected' : '',
            link: this.content.link ? this.content.link : '',
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
            img = `<a href="${ this.content.link }" target="_blank">
                      <img src="${ this.getFormattedSrc(this.content.activeFormat) }" />
                   </a>`;
        }
        else {
            img = `<img src="${ this.getFormattedSrc(this.content.activeFormat) }" />`;
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

Object.assign(DynamicImage.prototype, prototype);

module.exports = DynamicImage;
