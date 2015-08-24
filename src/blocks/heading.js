"use strict";

/*
  Heading Block
*/

var Block = require('../block');
var i18n  = require('../i18n-stub.js');

module.exports = Block.extend({

  type: 'heading',

  title: function(){ return i18n.t('blocks:heading:title'); },

  editorHTML: '<h2 class="st-required st-text-block st-text-block--heading" contenteditable="true"></h2>',

  scribeOptions: {
    allowBlockElements: false,
    tags: {
      p: false
    }
  },

  icon_name: 'heading',

  controllable: true,

  controls: [{
        slug: 'framed',
        eventTrigger: 'change',
        fn: function(e) {
            e.preventDefault();

            this._scribe.el.focus();
            this._scribe.commands[e.target.value].execute();

            // @todo i18n the header levels
        },
        html:
            `<select>
                <option selected disabled value"">Selectionnez un niveau de titre</option>
                <option value="h1">Titre</option>
                <option value="h2">Sous-titre</option>
                <option value="h3">Intertitre</option>
            </select>`
  }],

  loadData: function(data){
    this.setTextBlockHTML(data.text);
  }
});
