var _ = require('../lodash.js');

function buildSelect(field) {
    field.label = field.label ? ('<label for="' + field.name + '">' + field.label + '</label>') : '';
    field.placeholder = field.placeholder ? ('<option value="" selected disabled>' + field.placeholder + '</option>') : '';
    field.multiple = field.multiple ? ('multiple="multiple"') : '';

    field.options = field.options.map(function(singleOption) {

        if (singleOption.selected && singleOption.selected !== '') {
            singleOption.selected = 'selected';
        }
        else {
            singleOption.selected = '';
        }

        return singleOption;
    });

    var selectTemplate = `
        <div class="st-block-field st-block-field-select">
            <%= label %>
            <select <%= multiple %> id="<%= name %>" name="<%= name %>">
                <%= placeholder %>
                <% _.forEach(options, function(option) { %>
                    <option <%= option.selected %> value="<%= option.value %>"><%= option.label %></option>
                <% }); %>
            </select>
        </div>
    `;

    return _.template(selectTemplate, { imports: { '_': _ } })(field);
}

function buildStandardField(field) {
    field.label = field.label || '';
    field.placeholder = field.placeholder || '';
    field.value = field.value || '';

    var fieldTemplate = `
        <div class="st-block-field st-block-field-standard">
            <label for="<%= name %>">
                <%= label %>
            </label>
            <input type="<%= type %>" name="<%= name %>" value="<%= value %>" placeholder="<%= placeholder %>"/>
        </div>
    `;

    return _.template(fieldTemplate)({
        name: field.name,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        value: field.value
    });
}

function buildField(field) {
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
}

function addNullOptionToArray(array, message) {
    var arrayCopy = array.slice();

    arrayCopy.unshift({
        value: '',
        label: message
    });

    return arrayCopy;
}

module.exports = {
    addNullOptionToArray: addNullOptionToArray,
    build: buildField
};
