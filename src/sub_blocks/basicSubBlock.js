var _ = require('../lodash.js');

var BasicSubBlock = function() {
    this.init.apply(this, arguments);
};

BasicSubBlock.prototype = {
    init: function(contents) {
        this.id = contents.id;

        this.contents = Object.assign(contents, {
            type: this.type
        });

        this.contents.url = this.contents.url ? this.contents.url : '';
    },

    renderSmall: function() {
        return _.template(this.smallTemplate, this.contents, { imports: { '_': _ }});
    },

    renderLarge: function() {
        return _.template(this.largeTemplate, this.contents, { imports: { '_': _ }});
    }
};

module.exports = BasicSubBlock;
