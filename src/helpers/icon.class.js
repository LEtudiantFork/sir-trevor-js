function getTemplate(name, src = 'http://placehold.it/100x100') {
    return `<div class="st-illustrated-icon" data-icon-name="${ name }"><img src="${ src }" /></div>`;
}

function constructor({ name, src }) {
    this.name = name;
    this.src = src;
    this.$elem = getTemplate(this.name, this.src);
}

export default {
    create(...args) {
        const instance = Object.assign({}, this.prototype);

        constructor.apply(instance, args);

        return instance;
    },
    prototype: {}
};

