var _ = require('../../../lodash.js');

var largeTemplate = [
    '<figure class="st-sub-block-image">',
        '<img src="<%= image %>" />',
    '</figure>',
    '<h3><%= title %></h3>',
    '<span><%= description %></span>',
    '<a class="st-sub-block-link st-icon" href="<%= url %>" target="_blank">link</a>'
].join('\n');

var quizPrototype = {
    prepareLargeMarkup: function() {
        return _.template(largeTemplate, this.content, { imports: { '_': _ } });
    }
};

module.exports = {
    prototype: quizPrototype
};
