var $             = require('jquery');
var _             = require('../../lodash.js');
var BasicSubBlock = require('../basic.class.js');
var eventablejs   = require('eventablejs');
var xhr           = require('etudiant-mod-xhr');

var fieldHelper = require('../../helpers/field.js');

var innerStaticTemplate = [
    '<%= legend %>',
    '<label><%= copyrightLabel %>&copy;</label> <span><%= copyright %></span>'
].join('\n');

var innerEditTemplate = [
    '<div class="st-sub-block-edit">',
        '<%= fields %>',
    '</div>'
].join('\n');

var footerTemplate = [
    '<footer>',
        '<button class="st-btn" data-button-type="save" type="button">',
            '<%= save %>',
        '</button>',
    '</footer>'
].join('\n');

function getFooter() {
    return _.template(footerTemplate, {
        save: i18n.t('sub_blocks:media:save')
    });
}

function saveSubBlock(field, subBlock) {
    var toSave = {};
    var name = field.name;
    var value = $(field).val();

    toSave[name] = value;

    subBlock.toSave = Object.assign({}, subBlock.toSave, toSave);
}

function watchFields(subBlock) {
    var $fields = subBlock.$elem.find('input, select');

    $fields.on('keyup', _.debounce(function() {
        saveSubBlock(this, subBlock);
    }, 400));

    $fields.on('change', function() {
        saveSubBlock(this, subBlock);
    });
}

var BasicMediaSubBlock = function() {
    BasicSubBlock.apply(this, arguments);
};

BasicMediaSubBlock.prototype = Object.create(BasicSubBlock.prototype);

BasicMediaSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {
    bindToRenderedHTML: function() {
        this.$elem = $('[data-sub-block-id="' + this.id + '"]');

        watchFields(this);

        this.$elem.on('click', '[data-button-type="save"]', function() {
            this.save();
        }.bind(this));
    },

    save: function() {
        // actually save here.
        if (this.isSaving !== true) {
            this.isSaving = true;

            if (this.isEditable) {
                var url = block.globalConfig.apiUrl + '/edt/media/' + this.id + '?access_token=' + block.globalConfig.accessToken;

                xhr.patch(url, saveData)
                    .then(function(returnedData) {
                        block.setData({
                            id: returnedData.content.id,
                            type: this.type
                        });

                        addBlockMessageTemporarily(block, i18n.t('general:save'));
                        this.isSaving = false;
                    })
                    .catch(function(err) {
                        console.error('Error updating media information', err);
                    });
            }
            else if (!_.isEmpty(saveData)) {
                block.setData(saveData);

                addBlockMessageTemporarily(block, i18n.t('general:save'));

                this.isSaving = false;
            }
        }

        this.trigger('save', this.toSave);
    },

    renderEditable: function() {
        this.isEditable = true;

        var fieldMarkup = '';

        fieldMarkup += fieldHelper.build({
            label: i18n.t('sub_blocks:media:legend'),
            name: 'legende',
            type: 'text',
            value: this.content.legend
        });

        fieldMarkup += fieldHelper.build({
            label: i18n.t('sub_blocks:media:copyright'),
            name: 'copyrights',
            multiple: true,
            type: 'select',
            options: this.content.copyrights
        });

        fieldMarkup += fieldHelper.build({
            label: i18n.t('sub_blocks:media:category'),
            name: 'id_categorie',
            type: 'select',
            options: this.content.categories
        });

        var editArea = _.template(innerEditTemplate, { fields: fieldMarkup });

        return _.template(this.outerTemplate,
            {
                id: this.id,
                type: this.type,
                file: this.content.file,
                editArea: editArea,
                footer: getFooter()
            }
        );
    },

    renderLarge: function(extraData) {
        extraData = extraData || {};

        var legend = field({
            label: i18n.t('sub_blocks:media:legend'),
            name: 'legend',
            value: this.content.legend
        });

        var editArea = _.template(innerStaticTemplate, {
            legend: legend,
            copyright: this.content.copyright,
            copyrightLabel: i18n.t('sub_blocks:media:copyright')
        });

        var outerTemplateData = {
                id: this.id,
                type: this.type,
                file: this.content.file,
                editArea: editArea,
                footer: getFooter()
        };

        if (extraData) {
            Object.keys(extraData).forEach(function(extraDataKey) {
                outerTemplateData[extraDataKey] = extraData[extraDataKey];
            });
        }

        return _.template(this.outerTemplate, outerTemplateData);
    },

    prepareSmallMarkup: function() {
        return _.template(this.smallTemplate, this.content, { imports: { '_' : _ } });
    },

    prepareLargeMarkup: function() {
        return _.template(this.largeTemplate, this.content, { imports: { '_' : _ } });
    }
};

Object.assign(BasicMediaSubBlock.prototype, prototype, eventablejs);

module.exports = BasicMediaSubBlock;
