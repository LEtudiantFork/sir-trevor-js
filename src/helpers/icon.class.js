function getTemplate(name, src = 'http://placehold.it/100x100') {
    return `<div class="st-illustrated-icon" data-icon-name="${name}"><img src="${src}" /></div>`;
}

function constructor() {
    this.$elem = getTemplate(this.name, this.src);
}

const prototype = {};

module.exports = {
    create: function(data) {
        const instance = Object.assign({}, prototype, data);

        constructor.call(instance);

        return instance;
    }
};

