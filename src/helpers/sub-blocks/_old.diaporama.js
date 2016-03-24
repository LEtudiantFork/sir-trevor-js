var _         = require('../../../lodash.js');
// var Diaporama = require('../../../helpers/diaporama.class.js');

var smallTemplate = `
    <figure class="st-sub-block-diaporama">
        <img src="<%= thumbnail %>" />
    </figure>
    <h3><%= legend %></h3>
    <a class="st-sub-block-link st-icon" href="<%= file %>" target="_blank">link</a>
`;

// function renderImage(src) {
//     var img = document.createElement('img');

//     img.src = src;

//     return img;
// }

function init() {
    this.smallTemplate = smallTemplate;
}

var diaporamaPrototype = {
    prepareSmallMarkup: function() {
        return _.template(smallTemplate, { imports: { '_': _ } })(this.content);
    }

    // renderLarge: function() {
    //     this.prepareForRender();

    //     var slides = [];
    //     var thumbs = [];

    //     this.content.images.forEach(function(image) {
    //         slides.push(renderImage(image.file));

    //         thumbs.push(renderImage(image.thumbnail));
    //     });

    //     var diaporama = Diaporama.create({
    //         slides: slides,
    //         thumbs: thumbs
    //     });

    //     this.$elem.append(diaporama.$elem);

    //     this.$elem.addClass('st-sub-block-size-large');

    //     this.renderedAs = 'large';

    //     return this.$elem;
    // }
};

module.exports = {
    init: init,
    prototype: diaporamaPrototype
};
