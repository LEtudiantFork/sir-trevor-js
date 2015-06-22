var $ = require('jquery');
var _ = require('../../lodash.js');
var BasicMediaSubBlock = require('./basic-media.class.js');

var smallTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-small st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image">',
            '<img src="<%= file %>" />',
        '</figure>',
        '<h3><%= legend %></h3>',
        '<a class="st-sub-block-link st-icon" href="<%= file %>" target="_blank">link</a>',
    '</div>'
].join('\n');

var outerTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-large st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image">',
            '<img src="<%= file %>" />',
        '</figure>',
    '</div>'
].join('\n');

var innerStaticTemplate = [
    '<label>Legend</label><input text="" name="legend" value="<%= legend %>" />',
    '<label>Copyright</label><span>&copy;<%= copyright %></span>'
].join('\n');

var innerEditTemplate = [
    '<div class="st-sub-block-edit">',
        '<div class="st-sub-block-edit-item">',
            '<label>Legende</label>',
            '<input text="" name="legend" value="<%= legend %>" />',
        '</div>',
        '<div class="st-sub-block-edit-item">',
            '<label>Copyright</label>',
            '<select multiple>',
                '<% _.forEach(copyrights, function(copyright) { %>',
                    '<option value="<%= copyright.value %>"><%= copyright.label %></option>',
                '<% }); %>',
            '</select>',
        '</div>',
    '</div>'
].join('\n');

var footerTemplate = [
    '<footer>',
        '<button class="st-btn" data-button-type="save" type="button">',
            '<%= save %>',
        '</button>',
    '</footer>'
].join('\n');

function getEditArea(params) {
    return $(
        _.template(innerEditTemplate, params, { imports: { '_': _ } })
    );
}

function getFooter() {
    return $(
        _.template(footerTemplate, {
            save: i18n.t('sub_blocks:media:save')
        })
    );
}

var ImageSubBlock = function() {
    this.type = 'image';
    this.smallTemplate = smallTemplate;

    BasicMediaSubBlock.apply(this, arguments);
};

ImageSubBlock.prototype = Object.create(BasicMediaSubBlock.prototype);

ImageSubBlock.prototype.constructor = BasicMediaSubBlock;

var prototype = {
    activateRestricted: function() {

    },

    activateEditable: function(copyrights) {
        this.$elem = $(
            _.template(outerTemplate, this.contents)
        );

        this.$editArea = getEditArea({
            legend: this.contents.legend,
            copyrights: copyrights
        });

        this.$editArea.appendTo(this.$elem);

        this.$footer = getFooter();

        this.$saveButton = this.$footer.find('button[data-button-type="save"]');

        this.$footer.appendTo(this.$elem);
    },

    registerEvents: function() {
        this.$saveButton.on('click', this.save);
    },

    save: function() {

    }
};

Object.assign(ImageSubBlock.prototype, prototype);

module.exports = ImageSubBlock;
