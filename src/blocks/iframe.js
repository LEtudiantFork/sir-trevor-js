var $ = require('jquery');
var _ = require('../lodash.js');
var Block = require('../block');

var getTemplate = function(params) {
    var template = '';

    template += '<div class="st-block__iframe">';
    template += '<iframe';

    template += params.src ? ' src="' + params.src + '"' : '';
    template += params.scrolling ? ' scrolling="' + params.scrolling + '"' : '';
    template += params.height ? ' height="' + params.height + 'px"' : '';
    template += params.visible === false ? ' style="display:none"' : '';

    template += '></iframe>';
    template += '</div>';

    return template;
};

module.exports = Block.extend({
    title: 'iFrame',
    type: 'iframe',
    icon_name: 'iframe',

    pastable: true,
    paste_options: {
        html: '<input type="text" placeholder="' + i18n.t('blocks:iframe:placeholder') + '" class="st-block__paste-input st-paste-block">'
    },

    controllable: true,
    controls_position: 'top',
    controls_visible: false,
    controls: [
        {
            slug: 'height',
            eventTrigger: 'change',
            fn: function(e) {
                e.preventDefault();

                this.$iframe.css('height', e.target.value);

                this.setData({
                    height: e.target.value
                });
            },
            html: '<input type="number" placeholder="Hauteur" />'
        },
        {
            slug: 'scroll-toggle',
            eventTrigger: 'change',
            fn: function(e) {
                e.preventDefault();

                this.$iframe.attr('scrolling', e.target.value);

                // We need to set the src again to trigger the iframe refresh (to see the scrolling change) (required on Chrome 40 at least)
                var src = this.$iframe.attr('src');
                this.$iframe.attr('src', src);

                this.setData({
                    scrolling: e.target.value
                });
            },
            html: '<select><option value="no">Sans scroll</option><option value="yes">Avec scroll</option></select>'
        }
    ],

    editorHTML: '<div class="st-iframe-block"></div>',

    onBlockRender: function() {
        this.$editor.append(this.$iframeWrapper);
    },

    beforeBlockRender: function() {
        var template = getTemplate({
            height: 300,
            scrolling: 'no',
            visible: false
        });

        this.$iframeWrapper = $(template);
        this.$iframe = this.$iframeWrapper.find('iframe');
    },

    loadData: function(data) {
        this.$iframe.attr('src', data.src);
        this.$iframe.show();
    },

    onContentPasted: function(event) {
        this.setAndLoadData({
            src: $(event.target).val()
        });

        this.showControls();
    }
});
