var BasicSubBlock = function() {
    this.init.apply(this, arguments);
};

BasicSubBlock.prototype = {
    init: function(contents, type) {
        this.contents = Object.assign({}, contents, {
            type: type
        });
    },

    renderSmall: function() {
        return this.smallTemplate(this.contents);
    },

    renderLarge: function() {
        return this.largeTemplate(this.contents);
    }
};

module.exports = BasicSubBlock;
