var _ = require('../lodash');

var slideTemplate = _.template([
    '<div class="st-slider-slide">',
        '<%= slide_content %>',
    '</div>'
].join('\n'));

var Slide = function() {
    this.init.apply(this, arguments);
};

Slide.prototype = {

    init: function(id, contents, max) {
        this.template = slideTemplate;
        this.id = id;
        this.contents = contents;
        this.max = max;
    },

    isFull: function() {
        return this.max <= this.contents.length;
    },

    addItem: function(item) {
        this.contents.push(item);
    },

    render: function() {
        var markup = '';

        this.contents.forEach(function(content) {
            markup += content;
        });

        return this.template({
            slide_content: markup
        });
    }
};

module.exports = Slide;
