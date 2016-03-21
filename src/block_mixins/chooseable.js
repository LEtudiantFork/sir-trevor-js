var _ = require('../lodash');
var $ = require('etudiant-mod-dom').default;

const choiceContainer = (choices) => {
    return `
    <div class="st-block-controls__buttons">
        ${ choices.map(choice => choiceButton(choice)).join('') }
    </div>
    `;
};


const choiceButton = ({ icon, title, value}) => {
    return `
    <button class="st-block-controls__button" data-choice="${value}" type="button">
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
    return Array.prototype.slice.call(choiceBox.$elem[0].querySelectorAll('button.st-block-controls__button'));
}

const ChoiceBox = {
    create(chosen, choices, callback) {

        let instance = Object.assign(Object.create(this.prototype));

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
            this.$elem.on('click', 'a.st-btn', (e) => {
                e.preventDefault();

                var selectedId = $(e.currentTarget).data('choice');

                var choice = getChoice(this.choices, selectedId);

                this.chosen[choice.name] = selectedId;

                if (choice && choice.subChoice) {
                    var choicesMarkup = generateChoices(choice.subChoice.options);

                    this.$elem.html(choicesMarkup);
                    this.buttons = getButtons(this);
                }
                else {
                    this.$elem.remove();
                    this.callback(this.chosen);
                    this.destroy();
                }
            });
        },

        destroy() {
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

        this.choiceBox.appendTo(this.inner);
    }
};
