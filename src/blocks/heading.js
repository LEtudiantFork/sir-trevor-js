"use strict";

/*
  Heading Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

// @todo reimplement

function stripHeaderTags(string) {
    return string.replace(/<h1>(.*?)<\/h1>/g, '$1')
                 .replace(/<h2>(.*?)<\/h2>/g, '$1')
                 .replace(/<h3>(.*?)<\/h3>/g, '$1');
}

function changeHeaderLevel(block, level) {
    var textBlock = block.getTextBlock();

    var cleanedTextBlockContent = stripHeaderTags(textBlock.html());

    if (cleanedTextBlockContent.length > 0) {
        textBlock.html('<' + level + '>' + cleanedTextBlockContent + '</' + level + '>');
    }
}

module.exports = Block.extend({

  type: 'heading',

  title: function(){ return i18n.t('blocks:heading:title'); },

  editorHTML: '<div class="st-required st-text-block st-text-block--heading" contenteditable="true"></div>',

  scribeOptions: { allowBlockElements: true },

  icon_name: 'heading',

  loadData: function(data){
    if (this.options.convertFromMarkdown && data.format !== "html") {
      this.setTextBlockHTML(stToHTML(data.text, this.type));
    } else {
      this.setTextBlockHTML(data.text);
    }
  }
});
