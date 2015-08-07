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

function init() {
    this.smallTemplate = smallTemplate;
    this.largeTemplate = largeTemplate;
}

module.exports = {
    init: init
};
