var $ = require('etudiant-mod-dom').default;

function getTemplate(name, src = 'http://placehold.it/100x100') {
    return `<div class="st-illustrated-icon" data-icon-name="${name}"><img src="${src}" /></div>`;
}

function constructor() {
    this.$elem = getTemplate(this.name, this.src);
}

var prototype = {};

module.exports = {
    create: function(data) {
        var instance = Object.assign({}, prototype, data);

        constructor.call(instance);

        return instance;
    }
};

