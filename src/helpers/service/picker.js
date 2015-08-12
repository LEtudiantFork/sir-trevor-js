var eventablejs = require('eventablejs');
var Modal       = require('etudiant-mod-modal');
var ServiceItem = require('./item.js');

var services = require('etudiant-mod-editor/data/services.json');

var servicePickerPrototype = {
    open: function() {
        this.modal.open();
    },

    renderAllServices: function() {
        var self = this;
        var $container = $('<div class="st-block-service-list"></div>')

        this.services.forEach(function(serviceItem) {

            serviceItem.on('selected', function(e) {
                self.trigger('selected', serviceItem);
                self.modal.close();
            });

            $container.append(serviceItem.$elem);
        });

        this.modal.appendToContentArea($container);
    }
};

module.exports = {
    create: function() {
        var instance = Object.assign({}, servicePickerPrototype, eventablejs);

        instance.modal = new Modal({
            slug: 'st-service-picker',
            theme: 'pandora'
        });

        instance.modal.render({
            header: 'Choisissez un service',
            content: '',
            footer: {
                ok: 'OK'
            }
        });

        instance.services = services.map(function(service) {
            return ServiceItem.create(service);
        });

        instance.renderAllServices();

        return instance;
    }
};

