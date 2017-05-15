/*
    Image Block
*/

import Block  from '../block';
import { get as getFilters } from '../helpers/filters';
import { API_URL, parse as parseFilters, getConfig } from '../helpers/filters-media';

const editorHTML = `
    <div class="st-block--image">
        <figure>
            <img class="st-block-img" />
        </figure>
        <input type="text" name="legend" />
    </div>
`;

export default Block.extend({
    onBlockRender: function() {
        this.onClickBinded = this.onClick.bind(this);
        this.$('img.st-block-img')[0].addEventListener('click',  this.onClickBinded);
    },


    onClick: function(e) {
        e.target.removeEventListener('click', this.onClickBinded);
        this.pandoraSearch = getFilters({
            url: `${ this.globalConfig.apiUrl }${ API_URL }${ this.globalConfig.application }`,
            filtersUrl: `${ this.globalConfig.apiUrl }/edt/media`,
            accessToken: this.globalConfig.accessToken,
            application: this.globalConfig.application,
            container: this.editor,
            type: "image",
            miniature: '866x495',
            callback: data => parseFilters(data).categories,
            getConfig
        });

        this.pandoraSearch.once('selected', ({ type, content }) => {
            this.pandoraSearch.destroy();
            this.pandoraSearch = null; // to garbage collect
            this.mediator.trigger('block:replace', this.el, type, content);
        });

    },

    type: 'image',

    title: () => i18n.t('blocks:image:title'),

    editorHTML,

    'icon_name': 'Image',

    toolbarEnabled: false,

    loadData({ miniature = '', legend = '' }) {
        this.$('input[name="legend"]')[0].value = legend;
        this.$('img.st-block-img')[0].src = miniature;
    }
});
