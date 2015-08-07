var _   = require('../lodash.js');
var xhr = require('etudiant-mod-xhr');

// prepares data for a template like '<option value="<%= value %>"><%= label %></option>'
function prepareForSelect(array, valueKeyName, labelKeyName) {
    return array.map(function(arrayItem) {
        return {
            label: arrayItem[labelKeyName],
            value: arrayItem[valueKeyName]
        };
    });
}

function alphabetise(array, sortKey) {
    return _.sortBy(array, function(arrayItem) {
        return _.camelCase(arrayItem[sortKey]);
    });
}

function fetch(params) {
    return xhr.get(params.apiUrl + '/edt/media/filters/' + params.application, {
        data: {
            access_token: params.accessToken
        }
    })
    .then(function(fetchedData) {
        if (fetchedData && fetchedData.content) {
            // homogenise the data into label,value pairs for the filterbar's select

            var categories = alphabetise(fetchedData.content.categories, 'label');
            var copyrights = alphabetise(fetchedData.content.copyrights, 'name');
            var formats = alphabetise(fetchedData.content.formats, 'label');

            return {
                categories: prepareForSelect(categories, 'id', 'label'),
                copyrights: prepareForSelect(copyrights, 'id', 'name'),
                formats: prepareForSelect(formats, 'id', 'label')
            };
        }
        else {
            return Promise.reject(fetchedData);
        }
    })
    .catch(function(err) {
        console.error(err);
    });
}

// adds format strings like '500x500' to each image
function prepareImageFormats(images, formats) {
    return images.map(function(image) {
        return prepareSingleImageFormat(image, formats);
    });
}

function prepareSingleImageFormat(image, formats) {
    image.formats = formats.filter(function(singleFormat) {
        return image.format_ids.indexOf(singleFormat.value) !== -1;
    });
    return image;
}

module.exports = {
    fetch: fetch,
    prepareImageFormats: prepareImageFormats,
    prepareSingleImageFormat: prepareSingleImageFormat
};
