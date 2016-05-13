import xhr from 'etudiant-mod-xhr';
import fieldHelper from '../helpers/field';
import PandoraSearch from '../helpers/pandora-search.class';

const cb = ({ content }) => content;

const sliderConfig = {
    controls: {
        next: i18n.t('blocks:filters:next'),
        prev: i18n.t('blocks:filters:prev')
    },
    itemsPerSlide: 2,
    increment: 2
};

function get(params) {
    const {
        url,
        filtersUrl,
        accessToken,
        application,
        container,
        type,
        callback = cb,
        getConfig
    } = params;

    return xhr
    .get(
        url,
        { data: { 'access_token': accessToken } },
        { cache: false }
    )
    .then(callback)
    .then(data => fieldHelper.addNullOptionToArray(data, i18n.t('blocks:filters:defaultOption')))
    .then(options => {
        const filterConfig = getConfig({
            url: filtersUrl,
            accessToken,
            application,
            type,
            options
        });

        return PandoraSearch.create({
            container,
            filterConfig,
            sliderConfig,
            subBlockType: type
        });
    })
    .catch(err => console.error(err.stack));
}

export default {
    get
};
