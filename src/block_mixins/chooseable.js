var _ = require('../lodash');
var $ = require('etudiant-mod-dom').default;

var eventablejs = require('eventablejs');

const containerClass = 'st-block-chooseable';
const buttonClass = 'st-block-chooseable__button';

const choiceContainer = (choices) => {
    return `
    <div class="${containerClass}">
        <div class="st-block-chooseable__buttons">
            ${ choices.map(choice => choiceButton(choice)).join('') }
        </div>
    </div>
    `;
};

const choiceButton = ({ icon, title, value}) => {
    return `
    <button class="${buttonClass}" data-choice="${value}" type="button">
        <svg class="st-icon">
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="inc/icons.svg#icon-${icon}"></use>
        </svg>
        ${title}
    </button>
    `;
};

function getChoice(choice, selected) {
    var found = {};

    if (choice.options) {
        choice.options.some(option => {
            if (option.value === selected) {
                found = Object.assign(found, {
                    name: choice.name,
                    value: option.value,
                    subChoice: option.subChoice
                });
                return true;
            }

            if (option.subChoice) {
                found = getChoice(option.subChoice, selected);
                if (found) { return true; }
            }

            return false;
        });
    }

    if (found) {
        return found;
    }

    return false;
}

function getButtons(choiceBox) {
    return Array.prototype.slice.call(choiceBox.$elem[0].querySelectorAll(`button.${buttonClass}`));
}

const ChoiceBox = {
    create(chosen, choices, callback) {

        let instance = Object.assign(Object.create(this.prototype), eventablejs);

        instance.choices = choices;
        instance.chosen = chosen;
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
            this.$elem.on('click', `button.${buttonClass}`, (e) => {
                e.preventDefault();

                var selectedId = $(e.currentTarget).data('choice');

                var choice = getChoice(this.choices, selectedId);

                this.chosen[choice.name] = selectedId;

                if (choice && choice.subChoice) {
                    var choicesMarkup = choiceContainer(choice.subChoice.options);

                    this.$elem.html(choicesMarkup);
                    this.buttons = getButtons(this);
                }
                else {
                    this.callback(this.chosen);
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
        let chosen = {};

        this.choiceBox = ChoiceBox.create(chosen, choices, callback);

        this.el.classList.add('st-chooseable--is-active');

        this.choiceBox.appendTo(this.el);

        this.choiceBox.on('destroy', () => {
            this.el.classList.remove('st-chooseable--is-active');
        });
    }
};
