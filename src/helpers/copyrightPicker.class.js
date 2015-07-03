'use strict';

var $ = require('jquery');
var eventablejs = require('eventablejs');
var _   = require('../lodash.js');
var xhr         = require('etudiant-mod-xhr');

var copyrightTemplate =  '<figcaption><select multiple class="copyright"></select><button class="validate">Ok</button>';

function prepareCopyrights(copyrights) {
    return copyrights.map(function(copyright) {
        return {
            value: copyright.id,
            label: copyright.name
        };
    });
}

function bindEventToCopyright(block) {

    var $validate = block.$el.find('figure figcaption .validate');

    $validate.on('click', function(ev){
        ev.preventDefault();

        var selecteds = '';

        $.each(block.$el.find('figure figcaption .copyright option:selected'), function(){
            selecteds = selecteds + ' ' + $(this).val();
        });

        var url = block.globalConfig.apiUrl + 'edt/media/' + block.imageId;
        var saveData = {};

        saveData.copyright = selecteds;
        saveData.id_categorie = 2;
        saveData.legende = selecteds;

        xhr.patch(url, saveData)
            .then(function() {
               console.log('Block informations updated');
            })
            .catch(function(err) {
                console.error('Error updating copyright informations', err);
            });
    });
}

function appendCopyrightSelector(block) {
    block.$el.find('figure').append(copyrightTemplate);
    bindEventToCopyright(block);
}

var CopyrightPicker = function(block) {
    appendCopyrightSelector(block);
    this.init(block);

};

var prototype = {
    init: function(block) {
        var categoryOptionsUrl = block.globalConfig.apiUrl + 'edt/media/filters/' + block.globalConfig.application;

        xhr.get(categoryOptionsUrl)
            .then(function(result) {
                var copyrights = prepareCopyrights(result.content.copyrights);

                var optionsHtml = '';

                Object.keys(copyrights).forEach(function(key){
                    var optionTpl = _.template('<option value="<%= value %>"><%= value %></option>');
                    optionsHtml = optionsHtml + optionTpl({
                        'value': copyrights[key].label
                    });
                });

                var $select = block.$el.find('figure figcaption .copyright');

                $select.append(optionsHtml);

            })
            .catch(function(err) {
                console.error(err);
            });
        }
};

CopyrightPicker.prototype = Object.assign({}, prototype, eventablejs);

module.exports = CopyrightPicker;
