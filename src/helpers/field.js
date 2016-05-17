function buildOptions(options) {
    return options.reduce((prev, option) => `
        ${ prev }
        <option ${ option.selected ? 'selected' : '' } value="${ option.value }">${ option.label }</option>
    `, '');
}

function buildSelect(field) {
    const multiple = field.multiple ? 'multiple="multiple"' : '';
    const placeholder = field.placeholder ? `<option value="" selected disabled>${ field.placeholder }</option>` : '';
    const disabled = field.options.then ? 'disabled' : '';

    return `
        <div class="st-block-field st-block-field-select">
            <label for="${ field.name }">${ field.label || '' }</label>
            <select ${ multiple } ${ disabled } id="${ field.name }" name="${ field.name }">
                ${ placeholder }
                ${ !disabled ? buildOptions(field.options) : '' }
            </select>
        </div>
    `;
}

function buildInput(field) {
    return `
        <div class="st-block-field st-block-field-standard">
            <label for="${ field.name }">${ field.label || '' }</label>
            <input type="${ field.type || 'search' }" id="${ field.name }" name="${ field.name }" value="${ field.value || '' }" placeholder="${ field.placeholder || '' }"/>
        </div>
    `;
}

function buildFields(field) {
    let fieldMarkup;

    switch (field.type) {
        case 'select':
            fieldMarkup = buildSelect(field);
            break;
        default:
            fieldMarkup = buildInput(field);
    }

    return fieldMarkup;
}

function addNullOptionToArray(array, message) {
    const arrayCopy = array.slice();

    arrayCopy.unshift({
        value: '',
        label: message
    });

    return arrayCopy;
}

export default {
    addNullOptionToArray,
    buildFields,
    buildOptions
};
