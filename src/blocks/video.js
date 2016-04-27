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

module.exports = Block.extend({

    type: 'video',

    toolbarEnabled: false,

    title: () => i18n.t('blocks:video:title'),

    icon_name: 'Video',

    editorHTML,

    loadData({ file = '', thumbnail = '' }){
        this.$('.c-video')[0].dataset.vidPoster = thumbnail;
        this.$('source')[0].src = file;
    },

    onBlockRender() {
        VidVideo.initViaDOM($(this.inner));
    }
});
