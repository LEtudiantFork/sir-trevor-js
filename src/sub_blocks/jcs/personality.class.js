var _ = require('../../lodash.js');

var BasicJcsSubBlock = require('./basic-jcs.class.js');

var largeTemplate = [
    '<figure class="st-sub-block-image">',
        '<img src="<%= image %>" />',
    '</figure>',
    '<h3><%= title %></h3>',
    '<span><%= description %></span>',
    '<a class="st-sub-block-link st-icon" href="<%= url %>" target="_blank">link</a>'
].join('\n');

var PersonalityJcsSubBlock = function() {
    BasicJcsSubBlock.apply(this, arguments);
};

PersonalityJcsSubBlock.prototype = Object.create(BasicJcsSubBlock.prototype);

PersonalityJcsSubBlock.prototype.constructor = BasicJcsSubBlock;

var prototype = {
    prepareLargeMarkup: function() {
        return _.template(largeTemplate, this.content, { imports: { '_': _ } });
    }
};

Object.assign(PersonalityJcsSubBlock.prototype, prototype);

module.exports = PersonalityJcsSubBlock;
