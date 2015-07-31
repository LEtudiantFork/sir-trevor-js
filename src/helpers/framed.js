var $     = require('jquery');
var _     = require('../lodash.js');
var Modal = require('etudiant-mod-modal');

var instance;

var template = [
    '<div class="st-framed-helper">',
        '<div>',
            '<label>test</label>',
            '<input type="text" name="" />',
        '</div>',
    '</div>'
].join('\n');

function buildElement(framed) {
    var $elem = $(_.template(template, { prop: 'hi' }));

    $elem.on('keyup', 'input[type="text"]', function(e) {
        framed.value = e.currentTarget.value;
    });

    return $elem;
}

var Framed = function() {
    this.modal = new Modal({
        slug: 'framed-helper',
        animation: 'fade',
        theme: 'pandora'
    });

    this.modal.render({
        header: 'Sélectionnez un style d\'encadr&eacute;',
        content: '',
        footer: {
            ok: 'OK'
        }
    });

    this.$elem = buildElement(this);

    this.$input = this.$elem.find('input[type="text"]');

    this.modal.appendToContentArea(this.$elem);
};

Framed.prototype = {
    open: function() {
        var self = this;

        self.value = '';
        self.$input.val('');

        var promise = function(resolve, reject) {
            self.modal.open();

            self.modal.on('close', function() {
                if (self.value !== '') {
                    resolve(self.value);
                }
                else {
                    reject();
                }
            });
        };

        return new Promise(promise);
    }
};

Framed.getInstance = function() {
    var promise = function(resolve, reject) {
        if (instance) {
            resolve(instance);
        }
        else {
            instance = new Framed();

            resolve(instance);
        }
    };

    return new Promise(promise);
};

module.exports = Framed;
