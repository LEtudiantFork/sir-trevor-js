/*
  Service Block
*/

var Block = require('../block');

var ServiceItem   = require('../helpers/service/item.js');
var ServicePicker = require('../helpers/service/picker.js');

module.exports = Block.extend({

    type: 'service',

    title: function() {
        return i18n.t('blocks:service:title');
    },

    icon_name: 'service',

    editorHTML: '<div class="st-service-block"></div>',

    loadData: function(data) {
        if (data.service) {
            // reinitialise a service
            var serviceItem = ServiceItem.create(data.service);

            serviceItem.$elem.appendTo(this.$editor);
        }
    },

    onBlockRender: function() {
        if (!this.blockStorage.data.service) {
            this.servicePicker = ServicePicker.create();

            this.servicePicker.open();

            this.servicePicker.on('selected', function(selectedService) {
                this.$editor.empty();

                this.$editor.append(selectedService.$elem);

                this.setData({
                    service: {
                        id: selectedService.id,
                        link: selectedService.link,
                        icon: selectedService.icon,
                        title: selectedService.title
                    }
                });
            }.bind(this));
        }
    }
});
