var $ = require('jquery');

var slideTemplate = '<div class="st-slider-slide"></div>';

var Slide = function() {
    this.init.apply(this, arguments);
};

Slide.prototype = {

    init: function(id, contents, max) {
        this.id = id;
        this.contents = contents;
        this.max = max;

        this.$elem = $(slideTemplate);
    },

    isFull: function() {
        return this.max <= this.contents.length;
    },

    addItem: function(item) {
        this.contents.push(item);
    },

    render: function() {
        this.$elem.empty();

        this.contents.forEach(function(contentItem) {
            this.$elem.append(contentItem);
        }.bind(this));

        return this.$elem;
    }
};

module.exports = Slide;
