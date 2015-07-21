var _             = require('../lodash.js');
var $             = require('jquery');
var BasicSubBlock = require('./basic.class.js');

var smallTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-small st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image">',
            '<img src="<%= thumbnail %>" />',
        '</figure>',
        '<h3><%= legend %></h3>',
        '<a class="st-sub-block-link st-icon" href="<%= file %>" target="_blank">link</a>',
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

var DynamicImage = function() {
    this.init.apply(this, arguments);
};

DynamicImage.prototype = {

    init: function(contents) {
        debugger;
        this.id = contents.id;

        this.contents = contents;
        this.contents.type = 'dynamic-image';

        this.smallTemplate = smallTemplate;
        this.largeTemplate = largeTemplate;
        this.inBlockTemplate = inBlockTemplate;
    },

    renderSmall: function() {
        return BasicSubBlock.renderSmall.call(this);
    },

    renderLarge: function() {
        return BasicSubBlock.renderLarge.call(this);
    },

    renderInBlock: function() {

    }
};

module.exports = DynamicImage;
