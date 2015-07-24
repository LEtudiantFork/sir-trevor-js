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
    bindHover: function(block, filteredImage){
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

        // @todo is media a separate variable or a reference to this.media ?
        var media = this.media; // check this line

        // @todo do we use media.width anywhere else ?
        media.width = this.media.size.split('x')[0];

        var btnTemplates = buttons(media);
        var self = this;

        block.getTextBlock().on('click', 'figure', function(e){
            e.preventDefault();
            e.stopPropagation();

            var imgClass = $(this).find('img').attr('class');
            var figureClasses = $(this).attr('class');

            // @todo remove inline CSS
            $(this).wrap('<div class="picture-wrapper wrapper ' + figureClasses +' '+ imgClass + '" style="width: ' + self.media.size.split('x')[0] + 'px; height:' + self.media.size.split('x')[1] + 'px"></div>');

            block.$el.find('.wrapper').append(btnTemplates).css('position', 'relative');
            block.$el.find('.st-block__control-ui-elements').append(btnTemplates).css('opacity', '1');
            block.$el.find('.st-block__control-ui-elements, .st-block__control-ui-elements *').attr('contenteditable', false);

            self.bindRemoveEvent(media.id);
            self.bindTogglEvent(media.id, block);
            self.bindUpdateEvent(media, block, filteredImage);
        });
    },

    // @todo this functionality should be moved out of filteredImageSubBlock
    bindRemoveEvent: function(elem) {
        // @todo remove jQuery selector reference
        $('.st-block-control-ui-btn--delete-picture' + elem).one('click', function() {
            $(this).parent().parent().parent().find('figure').remove();
            $('.st-block__control-ui-elements').remove();

        });
    },
    // @todo this functionality should be moved out of filteredImageSubBlock
    bindTogglEvent: function(elem, block) {
        // @todo remove jQuery selector reference
        $('.st-block-control-ui-btn--toggle-picture' + elem).one('click', function() {
            $(this).parent().parent().parent().find('figure').toggleClass('f-left').toggleClass('f-right');
            block.$el.find('.wrapper').contents().unwrap()
            block.$el.find('.wrapper').remove();
            $('.st-block__control-ui-elements').remove();
        });
    },
    // @todo this functionality should be moved out of filteredImageSubBlock
    bindUpdateEvent: function(elem, $block, filteredImage) {
        // @todo remove jQuery selector reference
        $('.st-block-control-ui-btn--update-picture').one('click', function(e) {
            $block.$el.find('.wrapper').contents().unwrap()
            $block.$el.find('.wrapper').remove();
            $('.st-block__control-ui-elements').remove();
            filteredImage.media.custom = filteredImage.resize(filteredImage.media.size);
            $block.filteredImage =  filteredImage;
             evt.publish('modal-gallery-step-2', $block);
        });
    }

};

Object.assign(filteredImageSubBlock.prototype, prototype);

module.exports = filteredImageSubBlock;
