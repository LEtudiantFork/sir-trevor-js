var $ = require('jquery');
var _ = require('../lodash.js');

var BasicSubBlock = function() {
    this.init.apply(this, arguments);
};

BasicSubBlock.prototype = {
    init: function(contents) {
        this.id = contents.id;

        this.contents = contents;

        this.contents.type = this.type;
    },

    getElem: function() {
        this.$elem = $([ 'data-sub-block-id="' + this.id + '"' ]);
    },

    renderSmall: function(contents) {
        if (!contents) {
            contents = this.contents;
        }

        return _.template(this.smallTemplate, contents, { imports: { '_': _ } });
    },

    renderLarge: function(contents) {
        if (!contents) {
            contents = this.contents;
        }

        return _.template(this.largeTemplate, contents, { imports: { '_': _ } });
    }
};

module.exports = BasicSubBlock;
