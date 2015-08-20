/*
  Block Table
*/

var _     = require('../lodash');
var $     = require('etudiant-mod-dom');
var Block = require('../block');
var i18n  = require('../i18n-stub.js');

var template = [
    '<table>',
        '<caption contenteditable></caption>',
        '<thead>',
            '<tr>',
                '<th contenteditable></th>',
                '<th contenteditable></th>',
            '</tr>',
        '</thead>',
        '<tbody>',
            '<tr>',
                '<td contenteditable></td>',
                '<td contenteditable></td>',
            '</tr>',
        '</tbody>',
    '</table>'
].join('\n');

function countLineColspan(scope) {
    var count = 0;
    scope.find('th').each(function() {
        if (!isNaN($(this).attr('colspan'))) {
            count = count + parseInt($(this).attr('colspan'));
        }
        else {
            count++;
        }
    });
    return parseInt(count);
}

function addCell(row, cellTag) {
    if (cellTag === undefined) {
        var tag_template = _.template('<<%= tag %>>');

        cellTag = tag_template({
            tag: $(row).children().first().prop('tagName').toLowerCase()
        });
    }

    $(row).append($(cellTag, {
        contenteditable: ''
    }));
}

function addColumnHandler(ev, scope) {
    ev.preventDefault();

    scope.find('tr').each(function() {
        addCell(this);

    });

    scope.find('td, th').each(function() {
        if (undefined === $(this).attr('colspan')){
            $(this).attr('colspan', 1);
        }
    });
}

function mergeCellHandler(ev, scope) {
    ev.preventDefault();

    var table = scope.find('table');
    var activated = !$('.st-block-control-ui-btn--merge').hasClass('activated');

    table.find('td, th').each(function(){
        var colspanValue = parseInt($(this).attr('colspan'));

        if (isNaN(colspanValue)){
            $(this).attr('colspan', 1);
        }
    });

    if (activated === true) {
        table.find('td , th').addClass('mergeable');

        table.on('click', 'td, th', function(e) {
            e.preventDefault();

            if ($(this).next('td, th').index() !== -1) {
                var nextWidth = parseInt($(this).next('td, th').attr('colspan'));
                var colspanValue = parseInt($(this).attr('colspan'));

                $(this).next('td, th').remove();

                $(this).attr('colspan', colspanValue + nextWidth);
            }

            table.find('td, th').addClass('mergeable');
        });
    }
    else {
        table.off('click');
        table.find('td, th').attr('contenteditable', '');
        table.find('td, th').removeClass('mergeable');
    }
}

function unMergeCellHandler(ev, scope) {
    ev.preventDefault();

    var activated = !$('.st-block-control-ui-btn--unmerge').hasClass('activated');
    var table = scope;

    if (activated === true){
        table.find('td, th').each(function(){
            var colspanValue = parseInt($(this).attr('colspan'));

            if (colspanValue > 1) {
                $(this).addClass('unmergeable');
            }
        });

        table.on('click', 'td, th', function() {
            var colspanValue = parseInt($(this).attr('colspan'));

            if (colspanValue > 1 && $(this).is('td')) {
                $(this).attr('colspan', colspanValue - 1);
                $(this).parent().append('<td colspan="1"></td>');
            }

            if (colspanValue > 1 && $(this).is('th')) {
                $(this).attr('colspan', colspanValue - 1);
                $(this).parent().append('<th colspan="1"></th>');
            }

            table.find('td, th').each(function() {
                colspanValue = parseInt($(this).attr('colspan'));

                if (colspanValue > 1) {
                    $(this).attr('contenteditable', '');
                    $(this).addClass('unmergeable');
                }
                else {
                    $(this).removeClass('unmergeable');
                }
            });
        });
    }
    else {
        table.off('click');
        table.find('td, th').attr('contenteditable', '');
        table.find('td, th').removeClass('unmergeable');
    }
}

function deleteColumnHandler(ev, scope) {
    ev.preventDefault();

    scope.find('tr').each(function() {
        if ($(this).children().length > 1) {
            var colspanValue = parseInt($(this).children().last().attr('colspan'));

            if (colspanValue > 1) {
                $(this).children().last().attr('colspan', colspanValue - 1);
            }
            else {
                $(this).children().last().remove();
            }
        }
    });
    scope.find('th').each(function() {
        var colspanValue = parseInt($(this).last().attr('colspan'));
        if (colspanValue > 1) {
            $(this).last().attr('colspan', colspanValue - 1);
        }
        else {
            $(this).children().last().remove();
        }
    });
}

function addRowHandler(ev, scope) {

    scope.find('th').each(function() {
        if (undefined === $(this).attr('colspan')){
            $(this).attr('colspan', 1);
        }
    });

    var row = $('<tr>');
    var count = countLineColspan(scope);
    for (var i = 0; i < count; i++){
        addCell(row, '<td>');
    }

    scope.find('tbody').append(row);

    //Really important allow us to merge
    scope.find('td, th').each(function() {
        if (undefined === $(this).attr('colspan')){
            $(this).attr('colspan', 1);
        }
    });
}

function deleteRowHandler(ev, block) {
    ev.preventDefault();

    if (block.find('tbody tr').length > 1) {
        block.find('tbody tr:last').remove();
    }
}

function changeTheme(ev, block) {
    var table = block.find('table');
    var themeSelector = $('.theme-selector select');

    themeSelector.on('change', function() {
        var themeClass = $(this).find(':selected').val();
        table.removeClass();
        table.addClass(themeClass);
    });
}

module.exports = Block.extend({
    type: 'table',

    title: function() {
        return i18n.t('blocks:table:title');
    },

    icon_name: 'table',

    scope: function() {
        this.getBlock().find('table');
    },

    controllable: true,

    controls_position: 'top',
    controls_visible: true,
    controls: [
        {
            slug: 'theme-toggle',
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();

                var block = this.getBlock();
                changeTheme(e, block);
            },
            html: '<div class="theme-selector"><select><option class="theme edt-theme-default"  value="edt-theme-default">' + i18n.t('blocks:table:default') + '</option> <option class="theme edt-theme-blue" value="edt-theme-blue">' + i18n.t('blocks:table:blue-theme') + '</option><option class="theme edt-theme-red" value="edt-theme-red">' + i18n.t('blocks:table:red-theme') + '</option></select></div>'
        },
        {
            slug: 'add-column',
            icon: 'addcol',
            fn: function(e) {
                e.preventDefault();

                var block = this.getBlock();
                addColumnHandler(e, block);
            }
        },
        {
            slug: 'del-column',
            icon: 'delcol',
            fn: function(e) {
                e.preventDefault();

                var block = this.getBlock();
                deleteColumnHandler(e, block);
            }
        },
        {
            slug: 'add-row',
            icon: 'addrow',
            fn: function(e) {
                e.preventDefault();

                var block = this.getBlock();
                addRowHandler(e, block);
            }
        },
        {
            slug: 'del-row',
            icon: 'delrow',
            fn: function(e) {
                e.preventDefault();

                var block = this.getBlock();
                deleteRowHandler(e, block);
            }
        },
        {
            slug: 'merge',
            icon: 'merge',
            activable: i18n.t('blocks:table:helper-merge'),
            fn: function(e) {
                e.preventDefault();

                var block = this.getBlock();
                mergeCellHandler(e, block);
            }
        },
        {
            slug: 'unmerge',
            icon: 'unmerge',
            activable: i18n.t('blocks:table:helper-unmerge'),
            fn: function(e) {
                e.preventDefault();

                var block = this.getBlock();
                unMergeCellHandler(e, block);
            }
        }
    ],

    getBlock: function() {
        if (_.isUndefined(this.table_block)) {
            this.table_block = this.$('.st-table-block');
        }
        return this.table_block;
    },

    editorHTML: function() {
        var editor_template = '<div class="st-table-block">' + template + '</div>';

        return _.template(editor_template, this);
    },

    onBlockRender: function() {
        this.$table = this.getBlock().find('table');
    },

    loadData: function(data) {
        this.getBlock().html(data.text, this.type);
    },

    toMarkdown: function(html) {
        function rowToMarkdown(row) {
            var cells = $(row).children(),
                md = cells.map(function() {
                    if ($(this).attr('colspan') !== undefined) {
                        var txt = '#colspan' + $(this).attr('colspan') + ' ' + $(this).text();
                    }
                    else {
                        var txt = '#colspan1'+ ' ' + $(this).text();
                    }
                    return txt;
                }).get().join(' | ');

            if (cells[0].tagName === 'TH') {
                md += '\n';
                md += cells.map(function() {
                    return '---';
                }).get().join(' | ');
            }

            return md;
        }

        var markdown = $(html).find('tr').map(function() {
            return rowToMarkdown(this);
        }).get().join('\n');

        if ($(html).find('caption').text() !== '') {
            markdown += '\n[' + $(html).find('caption').text() + ']';
        }

        return markdown;
    },

    _serializeData: function() {
        var data = {};
        var tableBlock = this.$table;
        data.text = this.toMarkdown(tableBlock);

        return data;
    },

    loadData: function(data){
        this.getTextBlock().html(this.toHTML(data.text));
    },

    setAndLoadData: function(blockData) {
        this.setData(blockData);
        this.beforeLoadingData();
    },

    getTextBlock: function() {
        if (_.isUndefined(this.text_block)) {
            this.text_block = this.$('.st-text-block');
        }else{
            this.text_block = this.$('.st-table-block');
        }

        return this.text_block;
    },

    toHTML: function(markdown) {
        var html = $('<table><caption contenteditable></caption><thead><tr></tr></thead><tbody></tbody></table>'),
            lines = markdown.split('\n'),
            caption_re = /\[(.*)\]/;

        var lastline = lines[lines.length - 1];

        function getHashTag(text) {
            return text.match(/#\S+/g);
        }
        function splitHashTag(hashtag, searched) {
            if(hashtag.indexOf(searched) >= 0){
                return hashtag.split(searched)[1];
            }
        }
        function removeHashTag(hashtag, text) {
            return text.replace(hashtag, '');
        }

        if (lastline.match(caption_re)) {
            html.find('caption').text(lastline.match(caption_re)[1]);
            lines = lines.slice(0, lines.length - 1);
        }
        var content = '';

        $.each(lines[0].split(' | '), function(param, content) {
            var hashtags = getHashTag(content);
                colspan = '';
                var colspanValue = '';
                Object.keys(hashtags).forEach(function(key){
                    colspan = hashtags[key];
                    colspanValue = splitHashTag(hashtags[key], '#colspan');
                });
                var content = removeHashTag(colspan, content);
            html.find('thead tr').append('<th colspan="' + colspanValue + '" contenteditable>' + content + '</th>');
        });

        $.each(lines.slice(2, lines.length), function(line, tab) {
            var row = $('<tr>');
            $.each(tab.split(' | '), function(content, param) {
                var hashtags = getHashTag(param);
                colspan = '';
                var colspanValue = '';
                Object.keys(hashtags).forEach(function(key){
                    colspan = hashtags[key];
                    colspanValue = splitHashTag(hashtags[key], '#colspan');
                });
                var param = removeHashTag(colspan, param);
                row.append('<td colspan="' + colspanValue + '" contenteditable>' + param + '</td>');
            });
            html.find('tbody').append(row);
        });

        return html[0];
    }
});
