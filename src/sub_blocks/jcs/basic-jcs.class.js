var _ = require('../../lodash.js');

var BasicSubBlock = require('../basic.class.js');

var smallTemplate = [
    '<figure class="st-sub-block-image">',
        '<img src="<%= thumbnail %>" />',
    '</figure>',
    '<h3><%= title %></h3>',
    '<a class="st-sub-block-link st-icon" href="<%= url %>" target="_blank">link</a>',
    '<span class="st-sub-block-site"><%= site %></span>'
].join('\n');

var JcsSubBlock = function() {
    BasicSubBlock.apply(this, arguments);

    this.$elem.addClass('st-sub-block-jcs');
};

JcsSubBlock.prototype = Object.create(BasicSubBlock.prototype);

JcsSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {
    prepareSmallMarkup: function() {
        return _.template(smallTemplate, this.content, { imports: { '_': _ } });
    }
};

Object.assign(JcsSubBlock.prototype, prototype);

module.exports = JcsSubBlock;
