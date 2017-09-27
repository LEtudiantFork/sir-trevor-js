'use strict';

var utils = require('../utils');

module.exports = {

    mixinName: "Countable",

    initializeCountable: function() {
        utils.log("Adding countable to block " + this.blockID);

        var span = document.createElement('span');
        span.className = "st-count";

        this.el.insertBefore(span, this.inner);

        this.el.addEventListener('keyup', () => { setTimeout(() => {span.innerHTML = this.inner.querySelector('[contenteditable]').textContent.trim().length; },0); });

        setTimeout(() => {span.innerHTML = this.inner.querySelector('[contenteditable]').textContent.trim().length;},0);
    }
};
