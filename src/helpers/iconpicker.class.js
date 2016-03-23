var $           = require('etudiant-mod-dom').default;
var eventablejs = require('eventablejs');
var Icon        = require('./icon.class.js');
var Modal       = require('etudiant-mod-modal');
var xhr         = require('etudiant-mod-xhr').default;

// var mockIconData = require('etudiant-mod-editor/mock/icons.json');

function getIconById(icons, id) {
    return icons.filter(function(icon) {
        return icon.id.toString() === id.toString();
    })[0];
}

function constructor() {
    this.modal = Modal.create({
        slug: 'icons-picker',
        animation: 'fade',
        theme: 'pandora'
    });

    this.modal.render({
        header: 'Choisissez une icône',
        content: '',
        footer: {
            ok: 'OK'
        }
    });

    this.iconContainer = $('<div class="icon-picker-container"></div>');

    this.iconContainer.on('click', 'div.st-illustrated-icon', function(e) {
        this.trigger('selected', getIconById(this.icons, e.currentTarget.dataset.iconId));
    }.bind(this));

    this.modal.appendToContentArea(this.iconContainer);

    this.icons = [];

    /**
    xhr.get(`${this.apiUrl}/icons`, {
        data: {
            access_token: this.accessToken
        }
    })
    .then(function(iconsData) {
    **/

    var iconData = mockIconData.content;

    this.icons = iconData.map(function(iconDataItem) {
        return Icon.create(iconDataItem);
    }, this);

    this.icons.forEach(function(icon) {
        this.iconContainer.append(icon.$elem);
    }, this);

    /**
    }.bind(this))
    .catch(function(error) {
        console.error(error);
    });
    **/
}

var iconPickerPrototype = {

    close: function() {
        this.modal.hide();
    },

    destroy: function() {
        this.modal.destroy();
    },

    open: function() {
        this.modal.show();
    }

};

module.exports = {
    create: function(params) {
        var instance = Object.assign({}, iconPickerPrototype, eventablejs, params);

        constructor.call(instance, params);

        return instance;
    }
};
