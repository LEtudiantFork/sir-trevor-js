var $ = require('jquery');
var _ = require('lodash');

var utils = require('../utils');

module.exports = {
    mixinName: 'Controllable',

    initializeControllable: function() {
        utils.log('Adding controllable to block ' + this.blockID);

        this.$control_ui = $('<div>', {
            'class': 'st-block__control-ui'
        });

        // Alternative position of control-ui
        if (this.controls_position) {
            this.$control_ui.addClass(this.controls_position);
            this.$inner.addClass('has-control-ui__' + this.controls_position);
        }

        // Controls can be hidden by default
        if (this.controls_visible === false) {
            this.hideControls();
        }

        // Loop on controls to add them to the toolbar
        this.controls.forEach(function(control, index) {
            this.addUiControl(control, this.$control_ui, index);
        }, this);

        this.$inner.append(this.$control_ui);
    },

    hideControls: function() {
        this.$control_ui.addClass('hidden');
    },

    showControls: function() {
        this.$control_ui.removeClass('hidden');
    },

    controlsVisible: function() {
        return !this.$control_ui.hasClass('hidden');
    },

    initActivable: function(control) {
        this.$activable_ui = $('<div>', {
            'class': 'st-block__control-ui st-block__activable-ui'
        });

        // Alternative position of control-ui
        if (this.controls_position) {
            this.$activable_ui.addClass(this.controls_position);
        }

        var helperText = $('<div>', {
            'text': control.activable,
            'class': 'helper-text'
        });

        this.$activable_ui.append(helperText);

        this.$inner.append(this.$activable_ui);

        var closeControl = _.clone(control);
        closeControl.icon = 'cross';
        closeControl.activated = true;

        this.addUiControl(closeControl, this.$activable_ui);
    },

    destroyActivable: function() {
        this.$activable_ui.remove();
        this.$activable_ui = null;
    },

    addUiControl: function(control, $target, index) {
        // The UI Control can be a simple icon or a custom HTML
        if (!control.icon && !control.html) {
            console.error('UIcontrol "' + control.slug + '": You must choose an icon or html for your control.');
            return false;
        }

        if (!control.fn) {
            console.error('UIcontrol "' + control.slug + '": You must set a callback function.');
            return false;
        }
        if (this.activable === true) {
            var uiControl = this.getControlTemplate(control, 'hidden');
            this.eventBus.bind('button:control-' + index + ':enable', function() {
                uiControl.removeClass('hidden');
            });
            this.eventBus.bind('button:control-' + index + ':disable', function() {
                uiControl.addClass('hidden');
            });

        }
        else {
            uiControl = this.getControlTemplate(control);
        }

        if (this.paragraphable !== true && control.slug === 'add-paragraph') {
            return;
        }

        // By default, the trigger is a click event
        var eventTrigger = control.eventTrigger ? control.eventTrigger : 'click';
        var self = this;

        $target.append(uiControl);
        $target.on(eventTrigger, '.st-block-control-ui-btn--' + control.slug, function(e) {
            control.fn.call(self, e);

            if (control.activable) {
                if (self.controlsVisible()) {
                    self.hideControls();
                    self.initActivable(control);
                }
                else {
                    self.showControls();
                    self.destroyActivable();
                }
            }
        });
    },

    getControlTemplate: function(control, customClass) {
        var tag = $('<div class="st-block-control-ui-btn"></div>');
        if (customClass !== undefined) {
            tag.addClass(customClass);
        }

        if (control.activated) {
            tag.addClass('activated');
        }

        if (control.icon) {
            tag.attr('data-icon', control.icon);

            tag.addClass('st-icon');
            tag.addClass('st-block-control-ui-btn--' + control.slug);
        }
        else if (control.html) {
            tag.addClass('st-block-control-ui-extensible');

            var innerHTML = $(control.html);

            // For custom HTML we want to bind the event to the append element
            innerHTML.addClass('st-block-control-ui-btn--' + control.slug);

            tag.append(innerHTML);
        }

        return tag;
    }
};
