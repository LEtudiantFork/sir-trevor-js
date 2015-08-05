var $ = require('jquery');
var _ = require('../lodash.js');
var eventablejs = require('eventablejs');

// N.B
//
// This isn't really a sub block in the strictest of terms
// It does not inherit from basicSubBlock
//
// It's here because it's used at the same level as a subBlock in the embed Block

var outerTemplate = '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block__script"></div>';

var innerTemplate = [
    '<div data-script-container></div>',
    '<textarea cols="30" rows="10"></textarea>',
    '<div class="st-sub-block-footer">',
        '<button class="st-btn" data-button-type="save" type="button">',
            '<%= save %>',
        '</button>',
        '<button class="st-btn" data-button-type="edit" type="button">',
            '<%= edit %>',
        '</button>',
    '</div>'
].join('\n');

function checkHTML(html) {
    var doc = document.createElement('div');

    doc.innerHTML = html;

    return doc.innerHTML === html;
}

function getInner() {
    return $(
        _.template(innerTemplate, {
            save: i18n.t('sub_blocks:embed:script:save'),
            edit: i18n.t('sub_blocks:embed:script:edit')
        })
    );
}

function createBlock(subBlock, id) {
    var $elem = $(_.template(outerTemplate, { id: id }));

    return $elem.append(getInner());
}

function createJqueryObjects(subBlock) {
    subBlock.$textarea = subBlock.$elem.find('textarea');

    subBlock.$scriptContainer = subBlock.$elem.find('div[data-script-container]');

    subBlock.$saveButton = subBlock.$elem.find('button[data-button-type="save"]');
    subBlock.$editButton = subBlock.$elem.find('button[data-button-type="edit"]');
}

function bindEventsOnButtons(subBlock) {
    subBlock.$saveButton.on('click', subBlock.save.bind(subBlock));
    subBlock.$editButton.on('click', subBlock.edit.bind(subBlock));
}

var ScriptBlock = function() {
    this.init.apply(this, arguments);
};

var prototype = {
    init: function(params) {
        this.contents = params.contents || {};

        this.id = Date.now();

        this.$elem = createBlock(this.id);

        createJqueryObjects(this);

        bindEventsOnButtons(this);

        if (!_.isEmpty(this.contents)) {
            this.hydrateScriptContainer();
        }
    },

    hydrateScriptContainer: function() {
        this.$textarea.hide();

        this.$saveButton.attr('disabled', true);
        this.$editButton.removeAttr('disabled');

        var $generated = $('<div></div>');

        $generated.html(this.contents);

        this.$scriptContainer.append($generated);
    },

    edit: function() {
        this.$scriptContainer.empty();

        this.$textarea.show();

        this.$textarea.val(this.contents);

        this.$editButton.attr('disabled', true);
        this.$saveButton.removeAttr('disabled');
    },

    save: function() {
        var scriptSource = this.$textarea.val();

        if (checkHTML(scriptSource)) {
            this.contents = scriptSource;

            this.hydrateScriptContainer();

            this.trigger('valid', this.contents);
        }
        else {
            this.trigger('invalid');
        }
    },

    appendTo: function($elem) {
        this.$elem.appendTo($elem);
    }
};

ScriptBlock.prototype = Object.assign(prototype, eventablejs);

module.exports = ScriptBlock;
