var $ = require('etudiant-mod-dom');

var EventBus = require('../../event-bus.js');

var wrapperTemplate = '<div class="st-sub-block"></div>';

function init(params) {
    this.id = params.content.id;

    this.accessToken = params.accessToken;
    this.apiUrl = params.apiUrl;
    this.application = params.application;
    this.content = params.content;
    this.parentID = params.parentID;
    this.type = params.type;

    this.$elem = $(wrapperTemplate);

    this.$elem.attr('data-sub-block-id', this.id);
    this.$elem.addClass('st-sub-block-' + this.type);

    this.$elem.on('click', () => {
        if (this.renderedAs === 'small') {
            EventBus.trigger('sub-block-action:selected', this);
        }
    });
}

var basicPrototype = {
    prepareForRender: function() {
        this.$elem.empty();

        this.$elem.removeClassByPrefix('st-sub-block-size-');
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

module.exports = {
    init: init,
    prototype: basicPrototype
};
