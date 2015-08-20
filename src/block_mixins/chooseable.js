var $ = require('etudiant-mod-dom');
var _ = require('../lodash');

var choice_container = [
    '<div class="st-block__choices">',
        '<%= choices %>',
    '</div>'
].join('\n');

var choice_button = [
    '<a class="st-btn" data-choice="<%= value %>">',
        '<span class="st-icon"><%= icon %></span>',
        '<span><%= title %></span>',
    '</a>'
].join('\n');

function generateContainer(choices) {
    if (!choices) {
        choices = '';
    }

    return _.template(choice_container)({ choices: choices });
}

function generateChoices(choices) {
    var markup = '';

    choices.forEach(function(choice) {
        choice.icon = choice.icon ? choice.icon : '';

        markup += _.template(choice_button)(choice);
    });

    return markup;
}

function getChoice(choice, selected) {
    var found = {};

    if (choice.options) {
        choice.options.some(function(option) {
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
    return Array.prototype.slice.call(choiceBox.$elem[0].querySelectorAll('a.st-btn'));
}

var ChoiceBox = function(chosen, choices, callback) {
    this.choices = choices;
    this.chosen = chosen;
    this.callback = callback;

    this.$elem = $(generateContainer(generateChoices(choices.options)));

    this.buttons = getButtons(this);

    this.ready();
};

ChoiceBox.prototype = {
    getUnselected: function(selectedId) {
        return this.buttons.filter(function(button) {
            return button.dataset.choice !== selectedId;
        });
    },

    appendTo: function($elem) {
        this.$elem.appendTo($elem);
    },

    ready: function() {
        this.$elem.on('click', 'a.st-btn', function handleChoice(e) {
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
        }.bind(this));
    },

    destroy: function() {
        this.$elem = null;
    }
};


module.exports = {

    mixinName: 'Chooseable',

    initializeChooseable: function() {},

    createChoices: function(choices, callback) {
        var chosen = {};

        this.choiceBox = new ChoiceBox(chosen, choices, callback);

        this.choiceBox.appendTo(this.$inner);
    }
};
