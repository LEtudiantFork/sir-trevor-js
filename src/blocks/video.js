/*
    Video Block
*/

import Block  from '../block';

import $        from 'etudiant-mod-dom';
import VidVideo from 'etudiant-mod-video';

const editorHTML = `
    <div class="st-block--video">
        <video class="c-video">
            <source type="video/mp4" /><!-- Safari / iOS, IE9 -->

            Désolé ! Votre navigateur ne vous permet pas de visualiser cette vidéo
        </video>
    </div>
`;

export default Block.extend({

    type: 'video',

    title: () => i18n.t('blocks:video:title'),

    editorHTML,

    icon_name: 'Video',

    toolbarEnabled: false,

    loadData({ file = '', thumbnail = '' }){
        this.$('.c-video')[0].dataset.vidPoster = thumbnail;
        this.$('source')[0].src = file;
    },

    onBlockRender() {
        VidVideo.initViaDOM($(this.inner));
    }
});
