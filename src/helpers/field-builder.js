var _ = require('../lodash.js');

var buildSelect = function(field) {
    field.label = field.label ? ('<label for="' + field.name + '">' + field.label + '</label>') : '';
    field.placeholder = field.placeholder ? ('<option value="" selected disabled>' + field.placeholder + '</option>') : '';
    field.multiple = field.multiple ? ('multiple="multiple"') : '';

    var selectTemplate = [
        '<div class="st-block-field st-block-field-select">',
            '<%= label %>',
            '<select <%= multiple %> id="<%= name %>" name="<%= name %>">',
                '<%= placeholder %>',
                '<% _.forEach(options, function(option) { %>',
                    '<option value="<%= option.value %>"><%= option.label %></option>',
                '<% }); %>',
            '</select>',
        '</div>'
    ].join('\n');

    return _.template(selectTemplate, field, { imports: { '_': _ } });
};

var buildStandardField = function(field) {
    field.label = field.label || '';
    field.placeholder = field.placeholder || '';
    field.value = field.value || '';

    var fieldTemplate = [
        '<div class="st-block-field st-block-field-standard">',
            '<label for="<%= name %>">',
                '<%= label %>',
            '</label>',
            '<input type="<%= type %>" name="<%= name %>" value="<%= value %>" placeholder="<%= placeholder %>"/>',
        '</div>'
    ].join('\n');

    return _.template(fieldTemplate, {
        name: field.name,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        value: field.value
    });
};

var buildField = function(field) {
    var fieldMarkup;

    switch (field.type) {
        case 'select':
            fieldMarkup = buildSelect(field);
            break;
        default:
            fieldMarkup = buildStandardField(field);
            break;
    }

    return fieldMarkup;
};

module.exports = buildField;
