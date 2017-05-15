'use strict';

var utils = require('../utils');

module.exports = {

    mixinName: "Anchorable",

    initializeAnchorable: function() {
        utils.log("Adding anchorable to block " + this.blockID);

        var input = document.createElement('input');
        input.className = "st-input-string js-anchor-input";
        input.name = "anchor";
        input.setAttribute("placeholder", "Nom de l'ancre");
        input.value = this.blockStorage.data.anchor || this.blockID;
        input.style.display = "block";
        input.style.width = "200px";
        input.style.marginBottom = "10px";
        input.style.marginLeft = "40px";
        input.style.textAlign = "center";
        this.el.insertBefore(input, this.inner);

        //$(this.inner).append('<input class="st-input-string js-anchor-input" name="anchor" placeholder="Anchor name" style="width: 100%; margin-top: 10px; text-align: center">');
    },

    setAnchor: function(anchor) {
        //$(this.inner).find(".js-anchor-input").first().val(anchor);
    }

};
