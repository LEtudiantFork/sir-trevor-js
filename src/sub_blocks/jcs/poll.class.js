var _ = require('../../lodash.js');

var BasicJcsSubBlock = require('./basic-jcs.class.js');

var smallTemplate = [
    '<h3><%= title %></h3>',
    '<a class="st-sub-block-link st-icon" href="<%= url %>" target="_blank">link</a>',
    '<span class="st-sub-block-site"><%= site %></span>'
].join('\n');

var largeTemplate = [
    '<% if (choices && choices.length > 0) { %>',
    '<div class="st-sub-block-poll">',
            '<% _.forEach(choices, function(choice) { %>',
                '<div class="st-sub-block-poll-choice">',
                    '<span><%= choice.label %></span>',
                    '<meter min="0" max="100" value="<%= choice.percentage %>">',
                        '<div class="meter">',
                            '<span style="width: <%= choice.percentage %>%;"></span>',
                        '</div>',
                    '</meter>',
                '</div>',
            '<% }); %>',
        '</div>',
    '<% } %>',
    '<h3><%= title %></h3>',
    '<span><%= description %></span>',
    '<a class="st-sub-block-link st-icon" href="<%= url %>" target="_blank">link</a>'
].join('\n');

var PollJcsSubBlock = function() {
    BasicJcsSubBlock.apply(this, arguments);
};

PollJcsSubBlock.prototype = Object.create(BasicJcsSubBlock.prototype);

PollJcsSubBlock.prototype.constructor = BasicJcsSubBlock;

var prototype = {
    prepareSmallMarkup: function() {
        return _.template(smallTemplate, this.content, { imports: { '_': _ } });
    },

    prepareLargeMarkup: function() {
        return _.template(largeTemplate, this.content, { imports: { '_': _ } });
    }
};

Object.assign(PollJcsSubBlock.prototype, prototype);

module.exports = PollJcsSubBlock;
