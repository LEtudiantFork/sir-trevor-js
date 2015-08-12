var _ = require('../../../lodash.js');
var fieldHelper = require('../../../helpers/field.js');

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
    '<div class="st-sub-block-image__edit-bar">',
        '<%= fields %>',
    '</div>'
].join('\n');

function init() {
    this.smallTemplate = smallTemplate;
    this.largeTemplate = largeTemplate;
}

var imagePrototype = {
    prepareLargeMarkup: function() {
        var fields = '';

        fields += fieldHelper.build({
            type: 'text',
            placeholder: 'Saisissez un légende',
            name: 'legend',
            label: 'Légende',
            value: this.content.legend
        });

        fields += '<span> &copy;' + this.content.copyright + '</span>';

        var toRender = Object.assign({}, this.content, {
            fields: fields
        });

        return _.template(this.largeTemplate, toRender, { imports: { '_' : _ } });
    },

    save: function(changedElement) {
        if (changedElement) {
            this.content[changedElement.name] = changedElement.value;
        }

        this.trigger('save', {
            legend: this.content.legend
        });
    }

}

module.exports = {
    init: init,
    prototype: imagePrototype
};
