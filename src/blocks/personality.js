import Dom    from '../packages/dom';
import Block  from '../block';
import config from '../config.js';

const template = ({ title, description, thumbnail, url }) => `
    <h4>${ i18n.t('blocks:personality:title') }</h4>
    <img class="st-utils__v-middle" src="${ thumbnail }" width="100" height="100" />
    <strong>${ title }</strong>
    <p>${ description }</p>
    <a class="st-block-link" href="${ url }" target="_blank">
        <svg role="img" class="st-icon"><use xlink:href="${ config.defaults.iconUrl }#icon-fmt-link"/></svg>
    </a>
`;

module.exports = Block.extend({

    type: 'personality',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:personality:title'); },

    icon_name: 'personality',

    loadData(data){
        let quizElem = Dom.createElement('div', {
            'class': 'st-block--personality'
        });

        quizElem.innerHTML = template(data);

        this.inner.appendChild(quizElem);
    },

    onBlockRender() {}
});
