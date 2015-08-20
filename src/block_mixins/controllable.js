"use strict";

var utils = require('../utils');
var Dom = require('../packages/dom');
var Events = require('../packages/events');

module.exports = {
    mixinName: "Controllable",

    initializeControllable: function() {
        utils.log("Adding controllable to block " + this.blockID);

        this.control_ui = Dom.createElement('div', { class: 'st-block__control-ui' });

        this.controls.forEach(function(controlConfig, index) {
            // Bind configured handler to current block context
            this.addUiControl(controlConfig, index);
        }, this);

        this.inner.appendChild(this.control_ui);

        if (this.controls_visible === false) {
            this.hideControls();
        }
    },

    addUiControl: function(controlConfig, index) {
        // this.control_ui.appendChild(this.getControlTemplate(cmd));
        // Events.delegate(this.control_ui, '.st-block-control-ui-btn--' + cmd, 'click', handler);

        var uiControl;
        var eventTrigger = controlConfig.eventTrigger || 'click';

        if (this.activable === true) {
            uiControl = this.getControlTemplate(controlConfig, 'hidden');

            this.eventBus.bind('button:control-' + index + ':enable', function() {
                uiControl.removeClass('hidden');
            });

            this.eventBus.bind('button:control-' + index + ':disable', function() {
                uiControl.addClass('hidden');
            });
        }
        else {
            uiControl = this.getControlTemplate(controlConfig);
        }

        this.control_ui.appendChild(uiControl);

        Events.delegate(this.control_ui, '.st-block-control-ui-btn--' + controlConfig.slug, eventTrigger, function(e) {
            controlConfig.fn.call(this, e);

            if (controlConfig.activable) {
                if (self.controlsVisible()) {
                    self.hideControls();
                    self.initActivable(control);
                }
                else {
                    self.showControls();
                    self.destroyActivable();
                }
            }
        }.bind(this));
    },

    getControlTemplate: function(controlConfig, customClass) {
        var elem = Dom.createElement('a', {
            'data-icon': controlConfig.icon,
            'class': 'st-icon st-block-control-ui-btn st-block-control-ui-btn--' + controlConfig.slug
        });

        if (customClass) {
            elem.classList.add(customClass);
        }

        if (controlConfig.html) {
            elem.innerHTML = controlConfig.html;
        }

        return elem;
    },

    hideControls: function() {
        this.control_ui.classList.add('hidden');
    },

    showControls: function() {
        this.control_ui.classList.remove('hidden');
    },

    controlsVisible: function() {
        return !this.control_ui.classList.contains('hidden');
    },

    initActivable: function(control) {
        this.activable_ui = Dom.createElement('div', {
            class: 'st-block__control-ui st-block__activable-ui'
        });

        // Alternative position of control-ui
        if (this.controls_position) {
            this.activable_ui.classList.add(this.controls_position); //@todo class is too generic ?
        }

        var helperText = Dom.createElement('div', {
            text: control.activable,
            class: 'helper-text'
        })

        this.activable_ui.appendChild(helperText);

        this.inner.appendChild(this.activable_ui);

        var closeControl = _.clone(control);

        closeControl.icon = 'cross';
        closeControl.activated = true;

        this.addUiControl(closeControl, this.activable_ui);
    },

    destroyActivable: function() {
        this.activable_ui.remove();
        this.activable_ui = null;
    }
};
