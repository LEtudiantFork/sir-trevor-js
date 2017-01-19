import xhr from 'etudiant-mod-xhr';
import fieldHelper from './field';
import PandoraSearch from './pandora-search.class';

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

export function get({ url, filtersUrl, accessToken, application, container, type, miniature, getConfig = noop, callback = cb }) {
    const options = xhr
        .get(
            url,
            { data: { 'access_token': accessToken } },
            { cache: CACHED }
        )
        .then(callback)
        .then((data = []) => fieldHelper.addNullOptionToArray(data, i18n.t('blocks:filters:defaultOption')))
        .catch(err => {
            console.error(err);
            throw err;
        });
    const filterConfig = getConfig({
        url: filtersUrl,
        accessToken,
        application,
        type,
        miniature,
        options
    });
    return PandoraSearch.create({
        container,
        filterConfig,
        sliderConfig,
        subBlockType: type
    });
}
