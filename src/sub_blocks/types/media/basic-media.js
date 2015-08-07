var $           = require('jquery');
var _           = require('../../../lodash.js');
var xhr         = require('etudiant-mod-xhr');
var fieldHelper = require('../../../helpers/field.js');

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

var basicMediaPrototype = {
    save: function() {
        // if (this.isSaving !== true) {
        //     this.isSaving = true;

        //     if (this.isEditable) {
        //         var url = block.globalConfig.apiUrl + '/edt/media/' + this.id + '?access_token=' + block.globalConfig.accessToken;

        //         xhr.patch(url, saveData)
        //             .then(function(returnedData) {
        //                 block.setData({
        //                     id: returnedData.content.id,
        //                     type: this.type
        //                 });

        //                 addBlockMessageTemporarily(block, i18n.t('general:save'));
        //                 this.isSaving = false;
        //             })
        //             .catch(function(err) {
        //                 console.error('Error updating media information', err);
        //             });
        //     }
        //     else if (!_.isEmpty(saveData)) {
        //         block.setData(saveData);

        //         addBlockMessageTemporarily(block, i18n.t('general:save'));

        //         this.isSaving = false;
        //     }
        // }

        // this.trigger('save', this.toSave);
    },

    prepareSmallMarkup: function() {
        return _.template(this.smallTemplate, this.content, { imports: { '_' : _ } });
    },

    prepareLargeMarkup: function() {
        var toRender = Object.assign({}, this.content, {
            editArea: '',

        });

        return _.template(this.largeTemplate, toRender, { imports: { '_' : _ } });
    }

};

module.exports = {
    prototype: basicMediaPrototype
};
