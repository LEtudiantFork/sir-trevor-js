var videojs = require('video.js');

var smallTemplate = [
    '<figure class="st-sub-block-image">',
        '<img src="<%= thumbnail %>" />',
    '</figure>',
    '<h3><%= legend %></h3>',
    '<a class="st-sub-block-link st-icon" href="<%= file %>" target="_blank">link</a>'
].join('\n');

var largeTemplate = [
    '<div class="st-sub-block-video-wrapper">',
        '<video class="video-js vjs-default-skin" src="<%= file %>" poster="<%= thumbnail %>" /></video>',
    '</div>',
    '<%= editArea %>',
    '<%= footer %>'
].join('\n');

function init() {
    this.smallTemplate = smallTemplate;
    this.largeTemplate = largeTemplate;
}

var videoPrototype = {
    postRenderLarge: function() {
        var $video = this.$elem.find('video');

        videojs($video[0], {
            autoplay: false,
            controls: true
        }, function() {
            $video.parent()
                  .css('height', '100%')
                  .css('width', '100%');
        });
    }
}
module.exports = {
    init: init,
    prototype: videoPrototype
};
