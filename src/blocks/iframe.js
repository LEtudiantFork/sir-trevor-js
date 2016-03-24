var $     = require('etudiant-mod-dom').default;
var Block = require('../block');

const getTemplate = function({ src = '', scrolling = '', height = '', visible = false }) {
    src = src.length > 0 ? `src="${src}"` : '';
    scrolling = scrolling.length > 0 ? `scrolling="${scrolling}"` : '';
    height = height.length > 0 ? `height="${height}px"` : '';
    visible = visible ? 'style="display:none;"' : '';

    return `
        <div class="st-block__iframe">
            <iframe ${src} ${scrolling} ${height} ${visible} frameborder="0" allowfullscreen></iframe>
        </div>
    `;
};

module.exports = Block.extend({
    title() {
        return i18n.t('blocks:iframe:title');
    },

    type: 'iframe',

    icon_name: 'Code',

    pastable: true,
    controllable: true,

    paste_options: {
        html: `<input type="text" placeholder="${i18n.t('blocks:iframe:placeholder')}" class="st-block__paste-input st-paste-block">`
    },

    controls: {
        height: {
            event: 'change',
            html: '<input name="height" type="number" placeholder="Hauteur" />',
            cb(e) {
                e.preventDefault();

                this.$iframe.css('height', e.target.value);

                this.setData({
                    height: e.target.value
                });
            }
        },
        scrollToggle: {
            event: 'change',
            html: '<select name="scrolling"><option value="no">Sans scroll</option><option value="yes">Avec scroll</option></select>',
            cb(e) {
                e.preventDefault();

                this.$iframe.attr('scrolling', e.target.value);

                // We need to set the src again to trigger the iframe refresh (to see the scrolling change) (required on Chrome 40 at least)
                let src = this.$iframe.attr('src');

                this.$iframe.attr('src', src);

                this.setData({
                    scrolling: e.target.value
                });
            }
        }
    },

    editorHTML: '<div class="st-block--iframe"></div>',

    onBlockRender: function() {
        this.editor.appendChild(this.$iframeWrapper[0]);
    },

    beforeBlockRender: function() {
        let template = getTemplate({
            height: 300,
            scrolling: 'no',
            visible: false
        });

        this.$iframeWrapper = $(template);
        this.$iframe = this.$iframeWrapper.find('iframe');
    },

    loadData: function({ src, scrolling, height }) {
        this.$iframe.attr('src', src);

        if (scrolling) {
            this.$iframe.attr('scrolling', scrolling);

            let select = this.control_ui.querySelector('select[name="scrolling"]');

            if (select) {
                select.value = scrolling;
            }
        }

        if (height) {
            this.$iframe.attr('height', height);

            let input = this.control_ui.querySelector('input[name="height"]');

            if (input) {
                input.value = height;
            }
        }

        this.$iframe.css('display', 'block');
    },

    onContentPasted: function(event) {
        this.setAndLoadData({
            src: $(event.target).val()
        });
    }
});
