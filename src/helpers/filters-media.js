import * as _ from '../lodash';

const API_URL = '/edt/media/filters/';

// prepares data for a template like `<option value="${ value }">${ label }</option>`
function prepareForSelect(array = [], valueKey, labelKey) {
    if (!Array.isArray(array)) {
        return array;
    }

    return alphabetise(array, labelKey).map(item => ({
        label: item[labelKey],
        value: item[valueKey]
    }));
}

function alphabetise(array, sortKey) {
    return _.sortBy(array, item => _.camelCase(item[sortKey]));
}

function prepareSingleImageFormat(image, formats) {
    image.formats = formats.filter(singleFormat => image.format_ids.indexOf(singleFormat.value) !== -1);
    return image;
}

// adds format strings like '500x500' to each image
function prepareImageFormats(images, formats) {
    return images.map(image => prepareSingleImageFormat(image, formats));
}

function parse({ content }) {
    const categories = prepareForSelect(content.categories, 'id', 'label');
    const copyrights = prepareForSelect(content.copyrights, 'id', 'name');
    const formats = prepareForSelect(content.formats, 'id', 'label');

    return { categories, copyrights, formats };
}

function getConfig({ url, accessToken, application, type, options }) {
    return {
        url,
        accessToken,
        application,
        type,
        limit: 20,
        fields: [
            {
                type: 'search',
                name: 'query',
                placeholder: 'Rechercher'
            },
            {
                type: 'select',
                name: 'category',
                placeholder: 'Categorie',
                options
            }
        ]
    };
}

export {
    API_URL,
    parse,
    getConfig,
    prepareImageFormats
};
