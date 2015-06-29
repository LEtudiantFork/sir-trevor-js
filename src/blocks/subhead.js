'use strict';

/*
  subhead Block
*/
var Block = require('../block');
var stToHTML = require('../to-html');


function changeTitle(blockData, level) {
    var block = blockData.getTextBlock();
    if(block.children().html() !== undefined){
        var blockContent = block.html();
        if(blockContent.indexOf('<h1>') < 0 && blockContent.indexOf('<h2>') < 0 && blockContent.indexOf('<h3>') < 0) {
            blockContent = undefined;
        }
        else {
            blockContent = block.children().html();
        }
    }

    var content = block.html();

    if (blockContent !== undefined) {
       block.html('<' + level + '>' + blockContent + '</' + level + '>');
    }
    else if(content.length > 0) {
        block.html('<' + level + '>' + content + '</' + level + '>');
    }
}

module.exports = Block.extend({
    type: 'subhead',
    title: function() {
        return i18n.t('blocks:subhead:title');
    },
    icon_name: 'text',
    editorHTML: '<div class="st-required st__title st-text-block" contenteditable="true"></div>',
    controllable: true,
    controls_position: 'top',
    controls_visible: true,
    controls: [
        {
            slug: 'h1',
            eventTrigger: 'click',
            html: '<span>Titre 1</span>',
            fn: function(e) {
                e.preventDefault();
                changeTitle(this, 'h1');
            }
        },
        {
            slug: 'h2',
            eventTrigger: 'click',
            html: '<span>Titre 2</span>',
            fn: function(e) {
                e.preventDefault();
                changeTitle(this, 'h2');
            }
        },
        {
            slug: 'h3',
            eventTrigger: 'click',
            html: '<span>Titre 3</span>',
            fn: function(e) {
                e.preventDefault();
                changeTitle(this, 'h3');
            }
        }
    ],
     _serializeData: function(){
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

    setData: function(blockData) {
        Object.assign(this.blockStorage.data, blockData || {});
    },
    loadData: function(data){
        this.getTextBlock().html(stToHTML(data.text, this.type));
    },
    toMarkdown: function(markdown) {
        var stToMarkdown = require('../to-markdown');
        markdown =  markdown.replace(/<h1>(.*?)<\/h1>/g,'#$1')
                       .replace(/<h2>(.*?)<\/h2>/g,'##$1')
                       .replace(/<h2>(.*?)<\/h2>/g,'###$1');
        return stToMarkdown(markdown);
    },
    toHTML: function(markdown) {
        return markdown.replace(/###(.*)/g, '<h3>$1</h3>')
                       .replace(/##(.*)/g, '<h2>$1</h2>')
                       .replace(/#(.*)/g, '<h1>$1</h1>');

    }
});
