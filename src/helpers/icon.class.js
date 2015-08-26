var $ = require('etudiant-mod-dom');

function getTemplate(id, src = 'http://placehold.it/100x100') {
    return `<div class="st-illustrated-icon" data-icon-id="${id}"><img src="${src}" /></div>`;
}

function constructor() {
    this.id = Date.now();

    this.$elem = getTemplate(this.id, this.src);
}

var iconPrototype = {

};

module.exports = {
    create: function(data) {
        var instance = Object.assign({}, iconPrototype, data);

        constructor.call(instance);

        return instance;
    }
};

