'use strict';

var utils = require('../utils');
var config = require('../config');
var Dom = require('../packages/dom');
var Events = require('../packages/events');

module.exports = {

  mixinName: "Controllable",

  initializeControllable: function() {
    utils.log("Adding controllable to block " + this.blockID);
    this.control_ui = Dom.createElement('div', {'class': 'st-block__control-ui'});

    Object.keys(this.controls).forEach(cmd => {

      if (typeof this.controls[cmd] === 'function') {
        // Bind configured handler to current block context
        this.control_ui.appendChild(this.getControlTemplate(cmd));

        this.addUiControl(cmd, this.controls[cmd].bind(this));
      }
      else {
        this.control_ui.appendChild(this.controls[cmd].elem());

        this.addUiControl(cmd, this.controls[cmd].cb, this.controls[cmd].event)
      }

    });

    this.inner.appendChild(this.control_ui);
  },

  getControlTemplate: function(cmd) {
    return Dom.createElement("a", {
      'class': 'st-icon st-block-control-ui-btn st-block-control-ui-btn--' + cmd,
      'html': `<svg role="img" class="st-icon"><use xlink:href="${config.defaults.iconUrl}#icon-${cmd}"/></svg>`
    });
  },

  addUiControl: function(cmd, handler, eventType = 'click') {
    Events.delegate(this.control_ui, '.st-block-control-ui-btn--' + cmd, eventType, handler);
  }
};
