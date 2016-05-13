import * as _ from '../lodash';

const API_URL = '/jcs/thematics/list/';

function parse(data) {
    const { content } = data;

    if (Array.isArray(content)) {
        return content.map(({ id: value, label }) => ({ value, label }));
    }

    return Promise.reject(data);
}

function getConfig({ url, accessToken, application, options }) {
    return {
        url,
        accessToken,
        application,
        limit: 20,
        fields: [
            {
                type: 'search',
                name: 'query',
                placeholder: 'Rechercher'
            }, {
                type: 'select',
                name: 'thematic',
                placeholder: 'Thematique',
                options
            }
        ]
    };
}

export {
    API_URL,
    parse,
    getConfig
};
