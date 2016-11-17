/*
    Embeded selector Block
*/
import Block from '../block';
import { get as getFilters } from '../helpers/filters';
import { API_URL, parse as parseFilters, getConfig } from '../helpers/filters-embed';

const CHOOSEABLE = [
    {
        title: i18n.t('blocks:quiz:title'),
        api: 'quizzes',
        icon: 'quiz',
        type: 'quiz'
    },
    {
        title: i18n.t('blocks:personality:title'),
        api: 'personalities',
        icon: 'personality',
        type: 'personality'
    },
    /*{
        title: i18n.t('blocks:poll:title'),
        api: 'polls',
        icon: 'Poll',
        type: 'poll'
    },*/
    {
        title: i18n.t('blocks:script:title'),
        icon: 'script',
        type: 'script'
    }
];

export default Block.extend({

    type: 'embed',

    title: () => { return i18n.t('blocks:embed:title'); },

    editorHTML: '<div class="st-block--embed"></div>',

    'icon_name': 'insert-template',

    chooseable: true,

    toolbarEnabled: true,

    formatBarEnabled: false,

    onBlockRender() {
        this.createChoices(CHOOSEABLE, choice => {
            if (choice.type === 'script') {
                return this.mediator.trigger('block:replace', this.el, choice.type);
            }

            let pandoraSearch = getFilters({
                url: `${ this.globalConfig.apiUrl }${ API_URL }${ choice.api }`,
                filtersUrl: `${ this.globalConfig.apiUrl }/jcs/${ choice.api }/search`,
                accessToken: this.globalConfig.accessToken,
                application: this.globalConfig.application,
                container: this.editor,
                type: choice.type,
                callback: parseFilters,
                getConfig
            });

            pandoraSearch.once('selected', selected => {
                this.mediator.trigger('block:replace', this.el, selected.type, selected.content);

                pandoraSearch.destroy();
                pandoraSearch = null; // for garbage collection
            });
        });
    }
});
