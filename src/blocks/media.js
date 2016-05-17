/*
    Media selector Block
*/
import xhr from 'etudiant-mod-xhr';
import Block from '../block';
import { get as getFilters } from '../helpers/filters';
import { API_URL, parse as parseFilters, getConfig } from '../helpers/filters-media';

const CHOOSEABLE = [
    {
        title: i18n.t('blocks:image:title'),
        icon: 'Image',
        type: 'image'
    }, {
        title: i18n.t('blocks:video:title'),
        icon: 'Video',
        type: 'video'
    }, {
        title: i18n.t('blocks:diaporama:title'),
        api: '/edt/media/',
        icon: 'Diaporama',
        type: 'diaporama'
    }
];

export default Block.extend({

    type: 'media',

    title: () => i18n.t('blocks:media:title'),

    'icon_name': 'Image',

    chooseable: true,

    onBlockRender() {
        this.createChoices(CHOOSEABLE, choice => {
            let pandoraSearch = getFilters({
                url: `${ this.globalConfig.apiUrl }${ API_URL }${ this.globalConfig.application }`,
                filtersUrl: `${ this.globalConfig.apiUrl }/edt/media`,
                accessToken: this.globalConfig.accessToken,
                application: this.globalConfig.application,
                container: this.editor,
                type: choice.type,
                callback: data => parseFilters(data).categories,
                getConfig
            });

            const done = (type, data) => {
                this.mediator.trigger('block:replace', this.el, type, data);

                pandoraSearch.destroy();
                pandoraSearch = null; // to garbage collect
            };

            pandoraSearch.once('selected', selected => {
                const { type, api } = CHOOSEABLE.find(choice => choice.type === selected.type);

                if (!api) {
                    return done(type, selected.content);
                }

                xhr.get(`${ this.globalConfig.apiUrl }${ api }${ selected.id }`, {
                    data: { 'access_token': this.globalConfig.accessToken }
                })
                .then(({ content = {} }) => done(type, content));
            });
        });
    }
});
