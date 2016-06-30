function constructor(iconSlug) {
    this.$elem = `
        <div class="st-illustrated-icon" data-icon-name="${ iconSlug }">
            <svg class="c-icon-svg">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-${iconSlug}"></use>
            </svg>
        </div>
    `;
}

export default {
    create(...args) {
        const instance = Object.assign({}, this.prototype);

        constructor.apply(instance, args);

        return instance;
    },
    prototype: {}
};

