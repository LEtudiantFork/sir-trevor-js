/*
    Media selector Block
*/
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
        icon: 'Diaporama',
        type: 'diaporama'
    }
];

export default Block.extend({

    type: 'media',

    title: () => i18n.t('blocks:media:title'),

    'icon_name': 'Image',

    editorHTML: '<div class="st-block--media"></div>',

    chooseable: true,

    onBlockRender() {
        this.createChoices(CHOOSEABLE, choice => {
            this.pandoraSearch = getFilters({
                url: `${ this.globalConfig.apiUrl }${ API_URL }${ this.globalConfig.application }`,
                filtersUrl: `${ this.globalConfig.apiUrl }/edt/media`,
                accessToken: this.globalConfig.accessToken,
                application: this.globalConfig.application,
                container: this.editor,
                type: choice.type,
                callback: data => parseFilters(data).categories,
                getConfig
            });

            this.pandoraSearch.once('selected', ({ type, content }) => {
                this.pandoraSearch.destroy();
                this.pandoraSearch = null; // to garbage collect
                this.mediator.trigger('block:replace', this.el, type, content);
            });
        });
    }
});
