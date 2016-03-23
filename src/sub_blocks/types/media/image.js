var _ = require('../../../lodash.js');
var fieldHelper = require('../../../helpers/field.js');

var smallTemplate = `
    <figure class="st-sub-block-image">
        <img src="<%= file %>" />
    </figure>
    <h3><%= legend %></h3>
    <a class="st-sub-block-link st-icon" href="<%= file %>" target="_blank">link</a>
`;

var largeTemplate = `
    <figure>
        <img src="<%= file %>" />
        <figcaption>&copy; <%= copyright %></figcaption>
    </figure>
    <div class="st-sub-block-image__edit-bar">
        <%= legendField %>
    </div>
`;

function init() {
    this.smallTemplate = smallTemplate;
    this.largeTemplate = largeTemplate;
}

var imagePrototype = {
    prepareLargeMarkup: function() {
        var legendField = '';

        legendField += fieldHelper.build({
            type: 'text',
            placeholder: 'Saisissez un légende',
            name: 'legend',
            label: 'Légende',
            value: this.content.legend
        });

        var toRender = Object.assign({}, this.content, {
            legendField: legendField
        });

        return _.template(this.largeTemplate, { imports: { '_' : _ } })(toRender);
    },

    save: function(changedElement) {
        if (changedElement) {
            this.content[changedElement.name] = changedElement.value;
        }

        this.trigger('save', {
            legend: this.content.legend
        });
    }
};

module.exports = {
    init: init,
    prototype: imagePrototype
};
