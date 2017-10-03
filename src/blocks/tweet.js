import _ from '../lodash';
import utils from '../utils';
import xhr from 'etudiant-mod-xhr';

import Block from '../block';

const API_URL = '/edt/tweets/';

export default Block.extend({

    type: 'tweet',
    pastable: true,
    countable: false,
    specialchar: false,

    drop_options: {
        re_render_on_reorder: true
    },

    title() { return i18n.t('blocks:tweet:title'); },

    icon_name: 'Tweet',


    loadData(data) {
        if (data.html) {
            const { html } = data;
            this.inner.innerHTML = html;

            const [ , scriptUrl ] = /<script .+src="(\S+)"/gi.exec(html);
            const script = document.createElement('script');
            script.setAttribute('src', scriptUrl);

            this.inner.appendChild(script);
        }
    },

    onContentPasted(event) {
        // Pass this to the same handler as onDrop
        const url = event.target.value;

        if (!this.validTweetUrl(url)) {
            utils.log('Invalid Tweet URL');
            event.target.value = '';
            return;
        }

        this.handleTwitterDropPaste(event.target.value);
    },

    handleTwitterDropPaste(url) {
        // Twitter status
        let tweetID = url.match(/[^\/]+$/);
        if (!_.isEmpty(tweetID)) {
            this.loading();
            tweetID = tweetID[0];

            xhr.get(`${ this.globalConfig.apiUrl }${ API_URL }${ tweetID }`)
                .then(this.onTweetSuccess.bind(this))
                .catch(this.onTweetFail.bind(this));
        }
    },

    validTweetUrl(url) {
        return utils.isURI(url) &&
            url.indexOf('twitter') !== -1 &&
            url.indexOf('status') !== -1;
    },

    onTweetSuccess(data) {
        this.setAndLoadData(data);
        this.ready();
    },

    onTweetFail() {
        this.addMessage(i18n.t('blocks:tweet:fetch_error'));
        this.ready();
    },

    onDrop(transferData) {
        let url = transferData.getData('text/plain');
        if (!this.validTweetUrl(url)) {
            utils.log('Invalid Tweet URL');
            return;
        }
    }
});
