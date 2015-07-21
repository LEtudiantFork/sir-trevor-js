var _ = require('../lodash.js');
var $ = require('jquery');
var evt = require('etudiant-mod-mediator');
var BasicSubBlock = require('./basic.class.js');

// @todo decouple slider classnames
var smallTemplate = _.template([
    '<div class="slide-row">',
        '<div class="modal-row-picture row-<%= id %>" data-id="<%= id %>" data-image="<%= imageCustom %>">',
            '<img src="<%= image %>" alt="<%= legend %>" data-action="zoom"><div data-action="zoom" class="pic-container"><div class="pic-inside">Loupe</div></div>',
        '</div>',
        '<div class="modal-row-content row-<%= id %>">',
            '<form>',
                '<select class="sizes"> <%= options %> </select>',
            '</form>',
            '<legend><%= legend %></legend>',
            '<span>© Letudiant</span>',
        '</div>',
        '<div class="modal-row-actions">',
            '<span data-picture="<%= image %>" class="validate row-<%= id %>">Ok</span>',
        '</div>',
    '</div>'
].join('\n'));

// @todo decouple modal classnames
var largeTemplate = _.template([
    '<div class="modal-inner-content">',
        '<div class="modal-rows">',
            '<div class="modal-row">',
            '<div class="modal-row-picture" data-image="<%= id %>">',
                    '<img class="preview" src="<%= imageCustom %>" alt="placeholder" >',
                    '<br>',
                    '<p>Format <span class="size"><%= size %></span> </p>',
                    '<p><%= legend %></p>',
                '</div>',
                '<div class="modal-row-content">',
                    '<form>',
                        '<div class="row">',
                            '<label for="legend" class="picture-label">Légende</label>',
                            '<input type="text" class="picture-legend" placeholder="<%= legend %>" name="legend">',
                        '</div>',
                        '<div class="row">',
                            '<label for="link" class="link-label">Url</label>',
                            '<input type="text" class="picture-link" name="link">',
                        '</div>',
                        '<p class="external-link"></p>',
                        '<div class="row select">',
                            '<select class="position" data-row="<%= id %>" >',
                                '<option value="f-right" > A droite du texte</option>',
                                '<option value="f-left" > A gauche du texte</option>',
                            '</select>',
                        '</div>',
                    '</form>',
                '</div>',
            '</div>',
        '</div>',
    '</div>'
    ]
.join('\n'));

var blockTemplate = _.template([
    '<figure contenteditable="false" class="<%= align %>">',
        '<img contenteditable="false" data-width="<%= width %>" class=" picture-<%= id %>" alt="<%= legend %>" data-id="<%= id %>" src="<%= image %>">',
        '<figcaption contenteditable="false" class="picture-<%= id %>" > <span class="legend"><%= legend %></span> <br> copyright:<span class="copyright"><%= copyright %></span></figcaption>',
    '</figure>'
].join('\n'));


var filteredImageSubBlock = function(media) {
    if (media !== undefined) {
        this.media = media;
    }
    else {
        this.media = null;
    }
};

filteredImageSubBlock.prototype = Object.create(BasicSubBlock.prototype);

filteredImageSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {

    renderSmall: function(jsonMedia, size) {
        this.media = jsonMedia;
        this.media.imagePreview = this.resize('90x90');
        if (size !== undefined) {
            this.media.custom = this.resize(size);
        }
        else {
            this.media.custom = this.media.imagePreview;
        }
        var tpl = null;
        tpl = smallTemplate({
            id: jsonMedia.id,
            imageCustom: jsonMedia.custom,
            image: jsonMedia.imagePreview,
            options: this.media.format_ids,
            legend: jsonMedia.legend
        });
        return tpl;
    },

    renderLarge: function() {
        var tpl = null;

        // this.media.size = this.media.size;
        tpl = largeTemplate({
            id: this.media.id,
            imageCustom: this.media.custom,
            options: this.media.format_ids,
            size: this.media.size,
            legend: this.media.legend
        });
        return tpl;
    },

    // @todo - would renderInBlock be more semantic ?
    renderBlock: function() {
        var tpl = null;
        var size = this.media.size.split('x')[0];

        tpl = blockTemplate({
            id: this.media.id,
            image: this.resize(this.media.size),
            legend: this.media.legend,
            copyright: this.media.copyright,
            pictureWidth: size,
            align: this.media.align,
            size: size,
            width: this.media.size
        });
        return tpl;
    },

    // @todo improve this function - make it actually a resize
    resize: function(newSize) {
        return this.media.file.replace('original', newSize);
    },

    // @todo parseFilters should take place at a higher level - possibly in a 'image format' service
    parseFilters: function(jsonFilters) {
        var formatsObj = {};
        Object.keys(jsonFilters.content).forEach(function(key) {
            var formatsTabObject = jsonFilters.content.formats;
            Object.keys(formatsTabObject).forEach(function(k) {
                var formatObject = formatsTabObject[k];
                var id = formatObject.id;
                var label = formatObject.label;
                formatsObj[id] = label;
            });
        });
        return formatsObj;
    },

    // @todo subBlock should not work on block
    bindHover: function(block, filteredImage) {
        block.getTextBlock().off('click', 'figure');
        var buttons = _.template([
        '<div class="st-block__control-ui-elements top" style="min-width: <%= width %>; position:absolute; top:0; left:0; opacity:1; z-index:2">', // @todo remove CSS inline styles
            '<div class="st-block-control-ui-btn st-icon st-block-control-ui-btn--delete-picture st-icon st-block-control-ui-btn--delete-picture<%= id %>" data-id="<%= id %>"  data-icon="bin">',
            '</div>',
            '<div class="st-block-control-ui-btn st-icon st-block-control-ui-btn--toggle-picture st-icon st-block-control-ui-btn--toggle-picture<%= id %>" data-id="<%= id %>"  data-icon="image-">',
            '</div>',
            '<div class="st-block-control-ui-btn st-icon st-block-control-ui-btn--update-picture st-icon st-block-control-ui-btn--update-picture<%= id %>" data-id="<%= id %>"  data-icon="+">',
            '</div>',
        '</div>'
        ].join('\n'));


        // @todo do we use media.width anywhere else ? //Nope,  safely delete this
        this.media.width = this.media.size.split('x')[0];

        var btnTemplates = buttons(this.media);
        var self = this;
        self.block = block; //scoped the block

        //refactored the figure + wrapper (Done)
        block.getTextBlock().on('click', 'figure', function(e){
            e.preventDefault();
            e.stopPropagation();

            var imgClass = $(this).find('img').attr('class');
            var figureClasses = $(this).attr('class');

            self.$img = $(this); //scoped the img

            self.$wrapper = $('<div class="picture-wrapper wrapper ' + figureClasses + ' ' + imgClass + '" style="width: ' + self.media.size.split('x')[0] + 'px; height:' + self.media.size.split('x')[1] + 'px"></div>');
            self.$wrapper.append(btnTemplates).css('position', 'relative').css('opacity', '1');

            $(this).append(self.$wrapper);

            self.$wrapper.on('click', '.st-block-control-ui-btn--delete-picture', function() {
                self.$img.remove()
                self.$wrapper.remove();
            });

            self.$wrapper.on('click', '.st-block-control-ui-btn--toggle-picture', function() {
                self.$img.toggleClass('f-left').toggleClass('f-right');
                self.$wrapper.remove();
            });

            self.$wrapper.on('click', '.st-block-control-ui-btn--update-picture', function() {
                evt.publish('modal-gallery-step-2', self.block);
                self.$wrapper.remove();
            });

        });
    },

};

Object.assign(filteredImageSubBlock.prototype, prototype);

module.exports = filteredImageSubBlock;
