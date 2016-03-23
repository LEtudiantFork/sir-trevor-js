var _ = require('../../../lodash.js');

var smallTemplate = [
    '<figure class="st-sub-block-image">',
        '<img src="<%= thumbnail %>" />',
    '</figure>',
    '<h3><%= title %></h3>',
    '<a class="st-sub-block-link st-icon" href="<%= bo_link %>" target="_blank">link</a>',
    '<span class="st-sub-block-site"><%= site %></span>'
].join('\n');

function init() {
    this.$elem.addClass('st-sub-block-jcs');
}

var basicJcsPrototype = {
    prepareSmallMarkup: function() {
        return _.template(smallTemplate, { imports: { '_': _ } })(this.content);
    }
};

module.exports = {
    init: init,
    prototype: basicJcsPrototype
};
