'use strict';

const _     = require('../lodash');
const Dom   = require('../packages/dom');
const Block = require('../block');

import $        from 'etudiant-mod-dom';
import VidVideo from 'etudiant-mod-video';

const template = `
    <video class="c-video" data-vid-poster="<%= thumbnail %>">
        <source src="<%= file %>" type="video/mp4"><!-- Safari / iOS, IE9 -->

        Désolé ! Votre navigateur ne vous permet pas de visualiser cette vidéo
    </video>
`;


module.exports = Block.extend({

    type: 'video',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:video:title'); },

    icon_name: 'Video',

    loadData(data){
        if (data) {
            let renderedContent = _.template(template)(data);

            let videoElem = Dom.createElement('div', {
                'class': 'st-block--video'
            });

            videoElem.innerHTML = renderedContent;

            this.inner.appendChild(videoElem);
        }
    },

    onBlockRender() {
        VidVideo.initViaDOM($(this.inner));
    }
});
