var _ = require('../../lodash.js');

var BasicJcsSubBlock = require('./basicJcsSubBlock.js');

var largeTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-large st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image">',
            '<img src="<%= image %>" />',
        '</figure>',
        '<h3><%= title %></h3>',
        '<span><%= description %></span>',
        '<a class="st-sub-block-link st-icon" href="<%= url %>" target="_blank">link</a>',
    '</div>'
].join('\n');

var quizJcsSubBlock = function() {
    this.type = 'quiz';

    BasicJcsSubBlock.apply(this, arguments);

    this.largeTemplate = largeTemplate;
};

quizJcsSubBlock.prototype = Object.create(BasicJcsSubBlock.prototype);

quizJcsSubBlock.prototype.constructor = BasicJcsSubBlock;

module.exports = quizJcsSubBlock;
