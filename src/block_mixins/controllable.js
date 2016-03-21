'use strict';

var utils = require('../utils');
var config = require('../config');
var Dom = require('../packages/dom');
var Events = require('../packages/events');

const createControlsButton = () => {
  return Dom.createElement("a", {
      'class': 'st-block-ui-btn__settings',
      'html': `<svg role="img" class="st-icon">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="inc/icons.svg#icon-cog"></use>
              </svg>`
    });
}

module.exports = {

  mixinName: "Controllable",

  initializeControllable: function() {
    utils.log("Adding controllable to block " + this.blockID);
    this.control_ui = Dom.createElement('div', {'class': 'st-block__control-ui hidden'});

    this.on('onInitUI', () => {
      let blockUI = this.el.querySelector('.st-block__ui');

      let controlButton = createControlsButton();

      blockUI.appendChild(controlButton);

      controlButton.addEventListener('click', () => this.toggleControls());
    });

    Object.keys(this.controls).forEach(cmd => {

      if (typeof this.controls[cmd] === 'function') {
        // Bind configured handler to current block context
        this.control_ui.appendChild(this.getControlTemplate(cmd, `st-icon st-block-control-ui-btn st-block-control-ui-btn--${cmd}`));

        this.addUiControl(cmd, this.controls[cmd].bind(this));
      }
      else {
        this.control_ui.appendChild(this.getControlTemplate(cmd, this.controls[cmd].cssClasses, this.controls[cmd].html));

        this.addUiControl(cmd, this.controls[cmd].cb.bind(this), this.controls[cmd].event)
      }

    });

    this.inner.appendChild(this.control_ui);
  },

  toggleControls: function() {
      this.control_ui.classList.toggle('hidden');
  },

  getControlTemplate: function(cmd, cssClasses = 'st-block__control-ui__item', html = `<svg role="img" class="st-icon"><use xlink:href="${config.defaults.iconUrl}#icon-${cmd}"/></svg>`) {
    return Dom.createElement("div", {
      'data-st-controllable': cmd,
      'class': cssClasses,
      'html': html
    });
  },

  addUiControl: function(cmd, handler, eventType = 'click') {
    Events.delegate(this.control_ui, `[data-st-controllable="${cmd}"]`, eventType, handler);
  }
};
