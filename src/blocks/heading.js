/*
  Heading Block
*/
var Block    = require('../block');
var stToHTML = require('../to-html');
var utils    = require('../utils.js');

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

    title: function() {
        return i18n.t('blocks:heading:title');
    },

    icon_name: 'heading',

    controllable: true,

    editorHTML: '<div class="st-required st__title st-text-block" contenteditable="true"></div>',

    controls_position: 'top',
    controls_visible: true,
    controls: [
        {
            slug: 'h1',
            eventTrigger: 'click',
            html: '<span>Titre 1</span>',
            fn: function(e) {
                e.preventDefault();
                changeHeaderLevel(this, 'h1');
            }
        },
        {
            slug: 'h2',
            eventTrigger: 'click',
            html: '<span>Titre 2</span>',
            fn: function(e) {
                e.preventDefault();
                changeHeaderLevel(this, 'h2');
            }
        },
        {
            slug: 'h3',
            eventTrigger: 'click',
            html: '<span>Titre 3</span>',
            fn: function(e) {
                e.preventDefault();
                changeHeaderLevel(this, 'h3');
            }
        }
    ],

     _serializeData: function() {
        utils.log('toData for ' + this.blockID);

        var data = {};
        var textBlock = this.getTextBlock().html();

        if (textBlock !== undefined) {
            data.text = this.toMarkdown(textBlock);
        }
        else {
            data.text = '';
            return data;
        }

        return data;
    },

    getTextBlock: function() {
        this.text_block = this.$('.st-text-block');
        return this.text_block;
    },

    loadData: function(data){
        this.getTextBlock().html(stToHTML(data.text, this.type));
    },

    toMarkdown: function(markdown) {
        var stToMarkdown = require('../to-markdown');

        markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '#$1')
                       .replace(/<h2>(.*?)<\/h2>/g, '##$1')
                       .replace(/<h3>(.*?)<\/h3>/g, '###$1');

        return stToMarkdown(markdown);
    },

    toHTML: function(markdown) {
        return markdown.replace(/###(.*)/g, '<h3>$1</h3>')
                       .replace(/##(.*)/g, '<h2>$1</h2>')
                       .replace(/#(.*)/g, '<h1>$1</h1>');
    }
});
