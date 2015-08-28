/*
  Illustrated Block
*/

var $           = require('etudiant-mod-dom');
var Block       = require('../block');
var Icon        = require('../helpers/icon.class.js');
var IconPicker  = require('../helpers/iconpicker.class.js');
var i18n        = require('../i18n-stub.js');

module.exports = Block.extend({

    type: 'Illustrated',

    title: function() { return i18n.t('blocks:illustrated:title'); },

    controllable: true,
    controls_visible: true,

    controls: [
        {
            slug: 'change-color',
            eventTrigger: 'change',
            fn: function(e) {
                this.setData({
                    titleColor: e.target.value
                });

                this.editor.querySelector('.st-illustrated-inputs input[name="title"]').style.color = e.target.value;
            },
            html: '<input name="change-color" type="color" />'
        },
        {
            slug: 'change-icon',
            eventTrigger: 'click',
            fn: function() {
                if (!this.iconPicker) {
                    this.iconPicker = IconPicker.create({
                        apiUrl: this.globalConfig.apiUrl,
                        application: this.globalConfig.application,
                        accessToken: this.globalConfig.accessToken
                    });

                    this.iconPicker.on('selected', (selectedIcon) => {
                        this.setData({
                            icon: selectedIcon.src
                        });

                        this.iconPicker.close();

                        $(this.editor).find('.st-illustrated-icon').replaceWith(selectedIcon.$elem);

                    });
                }

                this.iconPicker.open();
            },
            html: '<button type="button">Ajouter une icône</button>'
        }
    ],

    editorHTML:
        `<div class="st-illustrated-block">
            <div class="st-illustrated-icon"></div>
            <div class="st-illustrated-inputs">
                <fieldset>
                    <label for="">Titre</label>
                    <input class="st-required" name="title" type="text" />
                </fieldset>
                <fieldset>
                    <label for="">Description</label>
                    <input class="st-required" name="description" type="text" />
                </fieldset>
            </div>
        </div>`,

    icon_name: 'illustrated',

    loadData: function(data) {
        if (data.icon) {
            var icon = Icon.create({ src: data.icon });

            $(this.editor).find('.st-illustrated-icon').replaceWith(icon.$elem);
        }

        if (data.title) {
            this.editor.querySelector('.st-illustrated-inputs input[name="title"]').value = data.title;
        }

        if (data.titleColor) {
            this.editor.querySelector('.st-illustrated-inputs input[name="title"]').style.color = data.titleColor;

            this.control_ui.querySelector('input[name="change-color"]').value = data.titleColor;
        }

        if (data.description) {
            this.editor.querySelector('.st-illustrated-inputs input[name="description"]').value = data.description;
        }
    },

    onBlockRender: function() {}
});
