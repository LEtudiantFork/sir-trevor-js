import $ from 'etudiant-mod-dom';
import eventablejs from 'eventablejs';
import config from '../config.js';

const CLASSES = {
    container: 'st-block-chooseable',
    button: 'st-block-chooseable__button'
};

function choiceContainer(choices) {
    return `
    <div class="${CLASSES.container}">
        <div class="st-block-chooseable__buttons">
            ${ choices.map(choice => choiceButton(choice)).join('') }
        </div>
    </div>
    `;
}

function choiceButton({ icon, title, value }) {
    return `
    <button class="${CLASSES.button}" data-choice="${value}" type="button">
        <svg class="st-icon"><use xlink:href="${ config.defaults.iconUrl }#icon-${icon}"></use></svg>
        ${title}
    </button>
    `;
}

function getChoice(choices, selected) {
    const choice = choices.options.find(option => {
        return matchChoice(option, selected);
    });

    if (choice) {
        return Object.assign({}, choice, { [choices.name]: choice.value });
    }
}

function matchChoice(option, selected) {
    let b = option.value === selected;

    if (!b && option.subChoice) {
        b = option.subChoice.some(option => {
            return matchChoice(option, selected);
        });
    }

    return b;
}

function getButtons(choiceBox) {
    return Array.prototype.slice.call(choiceBox.$elem[0].querySelectorAll(`button.${CLASSES.button}`));
}

const ChoiceBox = {
    create(choices, callback) {
        let instance = Object.assign(Object.create(this.prototype), eventablejs);

        instance.choices = choices;
        instance.callback = callback;

        instance.$elem = $(choiceContainer(choices.options));

        instance.buttons = getButtons(instance);

        instance.ready();

        return instance;
    },

    prototype: {
        getUnselected(selectedId) {
            return this.buttons.filter(button => {
                return button.dataset.choice !== selectedId;
            });
        },

        appendTo($elem) {
            this.$elem.appendTo($elem);
        },

        ready() {
            this.$elem.on('click', `button.${CLASSES.button}`, (e) => {
                e.preventDefault();

                const selectedId = $(e.currentTarget).data('choice');

                const choice = getChoice(this.choices, selectedId);

                if (choice && choice.subChoice) {
                    const choicesMarkup = choiceContainer(choice.subChoice.options);

                    this.$elem.html(choicesMarkup);
                    this.buttons = getButtons(this);
                }
                else {
                    this.callback(choice);
                    this.destroy();

                }
            });
        },

        destroy() {
            this.trigger('destroy');
            this.$elem.remove();
            this.$elem = null;
        }
    }
};

module.exports = {

    mixinName: 'Chooseable',

    initializeChooseable: function() {},

    createChoices(choices, callback) {
        this.choiceBox = ChoiceBox.create(choices, callback);

        this.el.classList.add('st-chooseable--is-active');

        this.choiceBox.appendTo(this.el);

        this.choiceBox.on('destroy', () => {
            this.el.classList.remove('st-chooseable--is-active');
        });
    }
};
