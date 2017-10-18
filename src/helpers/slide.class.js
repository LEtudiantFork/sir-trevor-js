import $ from 'jquery';

const slideTemplate = '<div class="st-slider-slide"></div>';

function init(id, contents, max) {
    this.id = id;
    this.contents = contents;
    this.max = max;

    this.$elem = $(slideTemplate);
}

export default {
    create() {
        const instance = Object.create(this.prototype);

        init.apply(instance, arguments);

        return instance;
    },

    prototype: {
        isFull() {
            return this.max <= this.contents.length;
        },

        addItem(item) {
            this.contents.push(item);
        },

        render() {
            this.$elem.empty();

            this.contents.forEach(contentItem => {
                this.$elem.append(contentItem);
            });

            return this.$elem;
        }
    }
};
