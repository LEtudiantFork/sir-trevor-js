var $ = require('jquery');
var _ = require('../lodash.js');

var wrapperTemplate = '<div class="st-sub-block"></div>';

var BasicSubBlock = function() {
    this.init.apply(this, arguments);
};

BasicSubBlock.prototype = {
    init: function(params) {
        this.accessToken = params.accessToken;
        this.apiUrl = params.apiUrl;
        this.application = params.application;
        this.content = params.content;
        this.id = params.content.id;
        this.parentId = params.parentId;
        this.type = params.type;

        this.$elem = $(wrapperTemplate);

        this.$elem.attr('id', this.id);
        this.$elem.addClass('st-sub-block-' + this.type);
    },

    prepareForRender: function() {
        this.$elem.empty();

        this.$elem.removeClass(function (index, css) {
            return (css.match (/(^|\s)st-sub-block-size-\S+/g) || []).join(' ');
        });
    },

    renderSmall: function() {
        this.prepareForRender();

        this.$elem.append(this.prepareSmallMarkup());

        this.$elem.addClass('st-sub-block-size-small');

        this.renderedAs = 'small';

        return this.$elem;
    },

    renderLarge: function() {
        this.prepareForRender();

        this.$elem.append(this.prepareLargeMarkup());

        this.$elem.addClass('st-sub-block-size-large');

        this.renderedAs = 'large';

        return this.$elem;
    }
};

module.exports = BasicSubBlock;
