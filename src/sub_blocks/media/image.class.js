var BasicMediaSubBlock = require('./basic-media.class.js');

var smallTemplate = [
    '<figure class="st-sub-block-image">',
        '<img src="<%= file %>" />',
    '</figure>',
    '<h3><%= legend %></h3>',
    '<a class="st-sub-block-link st-icon" href="<%= file %>" target="_blank">link</a>'
].join('\n');

var largeTemplate = [
    '<figure class="st-sub-block-image">',
        '<img src="<%= file %>" />',
    '</figure>',
    '<%= editArea %>',
    '<%= footer %>'
].join('\n');

var ImageSubBlock = function() {
    BasicMediaSubBlock.apply(this, arguments);

    this.smallTemplate = smallTemplate;
    this.largeTemplate = largeTemplate;
};

ImageSubBlock.prototype = Object.create(BasicMediaSubBlock.prototype);

ImageSubBlock.prototype.constructor = BasicMediaSubBlock;

ImageSubBlock.prototype = Object.assign(ImageSubBlock.prototype, {

});

module.exports = ImageSubBlock;
