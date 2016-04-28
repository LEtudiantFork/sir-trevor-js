import Block  from '../block';
import config from '../config';

const editorHTML = `
    <div class="st-block--personality">
        <img class="st-block-img st-utils__v-middle" src="" />
        <h4 class="st-block-title"></h4>
        <p class="st-block-description"></p>
        <a class="st-block-link" href="" target="_blank">
            <svg role="img" class="st-icon"><use xlink:href="${ config.defaults.iconUrl }#icon-fmt-link"/></svg>
        </a>
    </div>
`;

module.exports = Block.extend({

    type: 'personality',

    toolbarEnabled: false,

    title: () => i18n.t('blocks:personality:title'),

    icon_name: 'personality',

    editorHTML,

    loadData({ title = '', thumbnail = '', description = '', url = '' }) {
        this.$('.st-block-title')[0].innerHTML = title;
        this.$('img.st-block-img')[0].src = thumbnail;
        this.$('.st-block-description')[0].innerHTML = description;
        this.$('a.st-block-link')[0].href = url;
    }
});
