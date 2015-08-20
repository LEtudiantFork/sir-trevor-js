var $           = require('etudiant-mod-dom');
var _           = require('../../lodash.js');
var i18n        = require('../../i18n-stub.js');
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

function createBlock(subBlock, id) {
    var $elem = $(_.template(outerTemplate, { id: id }));

    $elem.html(
        _.template(innerTemplate, {
            save: i18n.t('sub_blocks:embed:script:save'),
            edit: i18n.t('sub_blocks:embed:script:edit')
        })
    );

    return $elem;
}

function init(params) {
    this.content = params.content || {};

    this.id = Date.now();

    this.$elem = createBlock(this.id);

    this.$textarea = this.$elem.find('textarea');
    this.$scriptContainer = this.$elem.find('div[data-script-container]');
    this.$saveButton = this.$elem.find('button[data-button-type="save"]');
    this.$editButton = this.$elem.find('button[data-button-type="edit"]');

    this.$saveButton.on('click', this.save.bind(this));
    this.$editButton.on('click', this.edit.bind(this));

    if (!_.isEmpty(this.content)) {
        this.hydrateScriptContainer();
    }
}

var scriptPrototype = {
    hydrateScriptContainer: function() {
        this.$textarea[0].style.display = 'none';

        this.$saveButton.attr('disabled', true);
        this.$editButton.removeAttr('disabled');

        this.$scriptContainer.html(this.content);
    },

    edit: function() {
        this.$scriptContainer[0].innerHTML = '';

        this.$textarea[0].style.display = 'block';

        this.$textarea.val(this.content);

        this.$editButton.attr('disabled', true);
        this.$saveButton.removeAttr('disabled');
    },

    save: function() {
        var scriptSource = this.$textarea.val();

        if (checkHTML(scriptSource)) {
            this.content = scriptSource;

            this.hydrateScriptContainer();

            this.trigger('valid', this.content);
        }
        else {
            this.trigger('invalid');
        }
    },

    appendTo: function($elem) {
        this.$elem.appendTo($elem);
    }
};

module.exports = {
    init: init,
    prototype: scriptPrototype
};
