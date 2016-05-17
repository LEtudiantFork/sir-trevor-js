import xhr from 'etudiant-mod-xhr';
import fieldHelper from '../helpers/field';
import PandoraSearch from '../helpers/pandora-search.class';

const cb = ({ content }) => content;
const noop = () => {};

const CACHED = false;

const sliderConfig = {
    controls: {
        next: i18n.t('blocks:filters:next'),
        prev: i18n.t('blocks:filters:prev')
    },
    itemsPerSlide: 2,
    increment: 2
};

export function get({ url, filtersUrl, accessToken, application, container, type, getConfig = noop, callback = cb }) {
    const options = xhr
        .get(
            url,
            { data: { 'access_token': accessToken } },
            { cache: CACHED }
        )
        .then(callback)
        .then(data => fieldHelper.addNullOptionToArray(data, i18n.t('blocks:filters:defaultOption')))
        .catch(err => console.error(err.stack));

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
}
