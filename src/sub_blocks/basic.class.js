var $ = require('jquery');

var EventBus = require('../event-bus.js');

var wrapperTemplate = '<div class="st-sub-block"></div>';

var BasicSubBlock = function() {
    this.init.apply(this, arguments);
};

BasicSubBlock.prototype = {
    init: function(params) {
        this.id = params.content.id;

        this.accessToken = params.accessToken;
        this.apiUrl = params.apiUrl;
        this.application = params.application;
        this.content = params.content;
        this.parentId = params.parentId;
        this.type = params.type;

        this.$elem = $(wrapperTemplate);

        this.$elem.attr('id', this.id);
        this.$elem.addClass('st-sub-block-' + this.type);

        this.$elem.on('click', function() {
            if (this.renderedAs === 'small') {
                this.activeFormat = this.$elem.find('select').val() || this.content.formats[0].label;

                EventBus.trigger('sub-block-action:selected', this);
            }
        }.bind(this));
    },

    prepareForRender: function() {
        this.$elem.empty();

        this.$elem.removeClass(function(index, css) {
            return (css.match(/(^|\s)st-sub-block-size-\S+/g) || []).join(' ');
        });
    },

    renderSmall: function() {
        this.prepareForRender();

        this.$elem.append(this.prepareSmallMarkup());

        this.$elem.addClass('st-sub-block-size-small');

        this.renderedAs = 'small';

        if ('postRenderSmall' in this) {
            this.postRenderSmall();
        }

        return this.$elem;
    },

    renderLarge: function() {
        this.prepareForRender();

        this.$elem.append(this.prepareLargeMarkup());

        this.$elem.addClass('st-sub-block-size-large');

        this.renderedAs = 'large';

        if ('postRenderLarge' in this) {
            this.postRenderLarge();
        }

        return this.$elem;
    }
};

module.exports = BasicSubBlock;
