import Dom    from '../packages/dom';
import Block  from '../block';
import config from '../config.js';

const template = ({ title, description, thumbnail, url }) => `
    <h4>${ i18n.t('blocks:poll:title') }</h4>
    <img class="st-utils__v-middle" src="${ thumbnail }" width="100" height="100" />
    <strong>${ title }</strong>
    <p>${ description }</p>
    <a class="st-block-link" href="${ url }" target="_blank">
        <svg role="img" class="st-icon"><use xlink:href="${ config.defaults.iconUrl }#icon-fmt-link"/></svg>
    </a>
`;

module.exports = Block.extend({

    type: 'poll',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:poll:title'); },

    icon_name: 'poll',

    loadData(data){
        let pollElem = Dom.createElement('div', {
            'class': 'st-block--poll'
        });

        pollElem.innerHTML = template(data);

        this.inner.appendChild(pollElem);
    },

    onBlockRender() {}
});
