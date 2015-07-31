'use strict';

var $           = require('jquery');
var eventablejs = require('eventablejs');
var _           = require('../lodash.js');
var xhr         = require('etudiant-mod-xhr');

var copyrightTemplate =  '<figcaption class="illustrated-figcaption"><select multiple class="copyright"></select><button class="validate">Ok</button>';

function prepareCopyrights(copyrights) {
    return copyrights.map(function(copyright) {
        return {
            value: copyright.id,
            label: copyright.name
        };
    });
}

function bindEventToCopyright(block) {
    var $save = block.$el.find('.illustrated-figure .validate');

    $save.on('click', function(ev){
        ev.preventDefault();

        var selecteds = block.$el.find('.illustrated-figure .copyright').val();

        var url = block.globalConfig.apiUrl + '/edt/media/' + block.imageId + '?access_token=' + block.globalConfig.accessToken;

        var saveData = {
            copyrights: selecteds,
            id_categorie: 2,
            legende: block.imageId
        };

        xhr.patch(url, saveData)
            .then(function() {
               console.log('Block informations updated');

               block.iconPicker.copyrightPicker.trigger('copyright:changed', saveData);
            })
            .catch(function(err) {
                console.error('Error updating copyright informations', err);
            });
    });
}

function appendCopyrightSelector(copyrightPicker, block) {
    block.$el.find('.illustrated-figure').append(copyrightTemplate);
    bindEventToCopyright(block);
}

var CopyrightPicker = function(block) {
    appendCopyrightSelector(this, block);
    this.init(block);
};

var prototype = {
    init: function(block) {
        var categoryOptionsUrl = block.globalConfig.apiUrl + '/edt/media/filters/' + block.globalConfig.application;

        xhr.get(categoryOptionsUrl, {
            data: {
                access_token: block.globalConfig.accessToken
            }
        })
        .then(function(result) {
            var copyrights = prepareCopyrights(result.content.copyrights);

            var optionsHtml = '';
            copyrights.forEach(function(copyright){
                var optionTpl = _.template('<option value="<%= value %>"><%= label %></option>');
                optionsHtml = optionsHtml + optionTpl({
                    'label': copyright.label,
                    'value': copyright.value
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
