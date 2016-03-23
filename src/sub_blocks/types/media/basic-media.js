var _           = require('../../../lodash.js');
var fieldHelper = require('../../../helpers/field.js');

var innerStaticTemplate = [
    '<%= legend %>',
    '<label><%= copyrightLabel %>&copy;</label><span> <%= copyright %></span>'
].join('\n');

function watchFields(subBlock) {
    var $fields = subBlock.$elem.find('input, select');

    $fields.on('keyup', _.debounce(function() {
        subBlock.save(this);
    }, 400));

    $fields.on('change', function() {
        subBlock.save(this);
    });
}

var basicMediaPrototype = {
    prepareSmallMarkup: function() {
        return _.template(this.smallTemplate, this.content, { imports: { '_' : _ } });
    },

    postRenderLarge: function() {
        if (this.hasRenderedLarge) {
            return false;
        }

        this.hasRenderedLarge = true;

        watchFields(this);
    }
};

module.exports = {
    prototype: basicMediaPrototype
};
