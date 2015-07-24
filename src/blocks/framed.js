'use strict';

/*
  Framed
*/

var $               = require('jquery');
var _               = require('../lodash.js');
var Block           = require('../block');
var eventBus        = require('../event-bus.js');
var evt             = require('etudiant-mod-mediator');
var Modal           = require('etudiant-mod-modal');
var ModalHelper     = require('../helpers/modal.class.js');
var Slider          = require('../helpers/slider.class.js');
var stToHTML        = require('../to-html');
var subBlockManager = require('../sub_blocks/index.js');
var xhr             = require('etudiant-mod-xhr');

var modalHelper = new ModalHelper();

// @todo remove CSS from JS
function getTemplate(params) {
    var template = '<div class="frame"  style=" background-color:' + params.frameColor + '; border: 3px solid ' + params.frameBorder + '">';
    template += '</div>';
    return template;
}

/**
 * Helper function to validate internal or external url
 */
function validateInternalUrl(url) {
    // @todo: still valid outside of dev ?
    var hostNames = [
        'http://www.letudiant.fr',
        'http://www.editor-poc.lh',
        'http://www.letudiant.fr/trendy'
    ];
    var internal = false;
    Object.keys(hostNames).forEach(function(k){
        var hostname = hostNames[k];
        if (url.indexOf(hostname) >= 0) {
           internal = true;
        }
        else if (url.slice(0, 1) === '#'){
            internal = true;
        }
        else if (url.slice(0, 1) === '/'){
            internal = true;
        }
    });

    return internal;
}

/**
 * Show/Hide controls depending on events
 *
 */
// @todo sliderControls needs a protection from multiple calls
function sliderControls(slider){

    slider.on('buttons:prev:disable', function() {
        $('body .modal-footer .before').addClass('disabled');
    });

    slider.on('buttons:prev:enable', function() {
        $('body .modal-footer').show();
        $('body .modal-footer .before').removeClass('disabled');
    });

    slider.on('buttons:next:disable', function() {
        $('body .modal-footer .next').addClass('disabled');
    });

    slider.on('buttons:next:enable', function() {
        $('body .modal-footer').show();
        $('body .modal-footer .next').removeClass('disabled');
    });

    $('body .modal-footer').on('click', '.before', function(){
        slider.prev();
    });

    $('body .modal-footer ').on('click', '.next', function(){
        slider.next();
    });
}

// @todo to refactor - duplicate code - see text.js
function textBlockListeners(textBlock){
    // textBlock.on('click', function(){
    //     if ($(this).hasClass('st-block-control-ui-btn')) {
    //         return;
    //     }
    //     sel = window.getSelection();
    //     range = sel.getRangeAt(0);

    // });

    /*
        on click update cursor position in contentEdtitable
     */
    textBlock.on('click', function(e){
        if ($(this).hasClass('st-block-control-ui-btn')) {
            return;
        }
        modalHelper.sel = window.getSelection();
        modalHelper.range = modalHelper.sel.getRangeAt(0);
    });

    /*
        on ENTER adapt newline behaviour - <br> instead of <p>
     */
    var range;

    textBlock.on('keypress', function(e){
        modalHelper.sel = window.getSelection();
        modalHelper.range = modalHelper.sel.getRangeAt(0);
        if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            var selection = window.getSelection();
            range = selection.getRangeAt(0);
            var newline = document.createElement('br');

            range.deleteContents();
            range.insertNode(newline);
            range.setStartAfter(newline);
            range.setEndAfter(newline);
            range.collapse(false);
            selection.removeAllRanges();
            modalHelper.sel.addRange(range);
        }
    });
}

// @todo refactor duplicate code - see text.js
function getModalMedias(block){
    var filterUrl = block.globalConfig.apiUrl + '/edt/media/filters/' + block.globalConfig.application;
    var initialMediaUrl = block.globalConfig.apiUrl + '/edt/media?application=' + block.globalConfig.application + '&type=image&limit=20';

    Promise.all([
        xhr.get(filterUrl, {
            data: {
                access_token: block.globalConfig.accessToken
            }
        }),
        xhr.get(initialMediaUrl, {
            data: {
                access_token: block.globalConfig.accessToken
            }
        })
    ])
    .then(function(data){
        var modalTemplateFilters = data[0];
        var modalTemplateStep1 = data[1];

        // eventBus.trigger('button:control-0:enable');

        /*
            @todo refactor

            filteredImageSubBlock should know how to initialise its own data

            jsonInit should be rendered obselete.

            jsonInit returns an array in an array ?

         */
        var mediasArray = subBlockManager.jsonInit(modalTemplateStep1, modalTemplateFilters);
        var filteredImages = subBlockManager.build('filteredImage', null, mediasArray[0]);
        var slides = [];

        Object.keys(modalTemplateStep1.content).forEach(function(k){
            modalHelper.filteredImagesTab['row-' + modalTemplateStep1.content[k].id] = filteredImages[k];

            // @todo filteredImageSubBlock should have all the data it requires on initialisation

            slides.push(filteredImages[k].renderSmall(modalTemplateStep1.content[k]));
        });

        var params = {
            contents: slides,
            itemsPerSlide: 5,
            increment: 2
        };

        var slider = new Slider(params);

        // slider.eventBus = eventBus;

        /*
            @todo refactor

            this function should be triggered automatically, no need for mediator
         */
        // Subcribe modals to mediator
        evt.subscribe('modal-gallery-step-1', function(param, channel) {
            modalHelper.openModalStep1(modalHelper.modalStep1, slider);

            var $modalInnerContent = $(modalHelper.modalStep1.$elem.children('.modal-inner-content')[0]);
            var fields = modalHelper.filterBarFormatter(modalTemplateFilters);
            var filterBar = modalHelper.loadFilterBar(block.globalConfig.apiUrl, block.globalConfig.accessToken, fields);

            // @todo see if slider still needs this function alwaysAppendToDOM?
            slider.alwaysAppendToDOM($modalInnerContent);

            /*
                @todo filterbar does not launch the first search
                @todo filterbar does not react to progress events on the slider
             */
            filterBar.on('search', function(returnedData){
                var filtersObj = filteredImages[0].parseFilters(modalTemplateFilters);
                // Prepare all selects options, then bind them in the object;

                /*
                    @todo again - filteredImageSubBlock should be able to update its own data
                    @tood option template should be in filteredImageSubBlock
                 */
                Object.keys(returnedData).forEach(function(key){
                    var list = '';
                    var formats = returnedData[key].format_ids;

                    Object.keys(formats).forEach(function(k){
                        var optionsTemplate = _.template('<option data-picture="<%= image %>" value="<%= format %>"><%= format %></option>');

                        list = list + optionsTemplate({
                            image: returnedData[key].file,
                            format: filtersObj[formats[k]]
                        });
                    });
                    returnedData[key].format_ids = list;
                });
                filteredImages = subBlockManager.build('filteredImage', returnedData, null);

                // reset slides to an empty array
                slides = [];

                Object.keys(returnedData).forEach(function(k){
                    modalHelper.filteredImagesTab['row-' + returnedData[k].id] = filteredImages[k];

                    // @todo filteredImageSubBlock should have all the data it requires on initialisation

                    slides.push(filteredImages[k].renderSmall(returnedData[k], 90));
                });

                slider.reset(slides);
                sliderControls(slider);
                // @todo modalHelper.selectUpdater() should be obselete
                // @todo filteredImageSubBlock should know how to update its selects
                modalHelper.selectUpdater();
                // @todo modalHelper.updateZoom() should be obselete
                // @todo filteredImageSubBlock should know how to update its selects
                modalHelper.updateZoom(modalHelper.filteredImagesTab);
            });

            // @todo modalHelper.selectUpdater() should be obselete
            // @todo filteredImageSubBlock should know how to update its selects
            modalHelper.selectUpdater();
            // @todo modalHelper.updateZoom() should be obselete
            // @todo filteredImageSubBlock should know how to update its selects
            modalHelper.updateZoom(modalHelper.filteredImagesTab);

            // @todo this should be handled in the slider
            $('body .modal-footer .before').addClass('disabled');

            sliderControls(slider);
            modalHelper.synchronizeAndOpenStep2(param);
            channel.stopPropagation();
        });

        evt.subscribe('modal-gallery-step-2', function(param) {
            if (param.filteredImage !== undefined) {
                modalHelper.modalTemplateStep2 = param.filteredImage.renderLarge();
            }
            modalHelper.openModalStep2(modalHelper.modalStep2);
            modalHelper.synchronizeAndCloseStep2(param);
        });

        block.ready();

        evt.publish('modal-gallery-step-1', block); //Call the modal event
    }).catch(function(err){
        console.error(err);
        console.error('Something went wrong');
    });
}


module.exports = Block.extend({

    type: 'framed',

    title: i18n.t('blocks:framed:title'),

    icon_name: 'framed',

    controllable: true,

    formattable: true,

    editorHTML: '<div class="st-text-block" contenteditable="true"></div>',

    eventBus: eventBus,

    controls_position: 'bottom',

    controls_visible: true,

    controls: [
        {
            slug: 'show-picture',
            'icon': 'image',
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                e.stopPropagation();
                // var block = this;
                this.loading();
                getModalMedias(this);
            }
        }

    ],

    onBlockRender: function() {
        // @todo remove CSS from JS
        var template = getTemplate({
            frameColor: '#536A4C',
            frameBorder: '#6C8365'
        });
        modalHelper.modalStep1 = new Modal({
            slug: 'gallery-step-1',
            animation: 'fade',
            theme: 'medias'
        });
        modalHelper.modalStep2 = new Modal({
            slug: 'gallery-step-2',
            animation: 'fade',
            theme: 'media'
        });

        this.$framed = $(template);
        var textBlock = this.getTextBlock();
        textBlockListeners(textBlock);

        textBlock.wrap(this.$framed);

    },

    // @todo after refacto - check if we still need to overwrite this 'private' method
    _serializeData: function() {
        var data = {};
        var textBlock = this.getTextBlock().html();
        if (textBlock !== undefined && textBlock.length > 0) {
            data.text = this.toMarkdown(textBlock);
        }
        else {
            data.text = '';
        }
        return data;
    },

    getTextBlock: function() {
        this.text_block = this.$('.st-text-block');
        return this.text_block;
    },

    // @todo ideally, setData should not be overwritten
    setData: function(blockData) {
        var content = this.getTextBlock();

        // @todo remove jQuery selector reference - very dangerous
        console.warn('Please find a way to remove this jQuery selector');

        $('.wrapper').contents().unwrap();
        $('.wrapper').remove();
        $('.st-block__control-ui-elements').remove();

        var framedContent;
        var frameText = content.html().replace(/(<\/?div>)/ig, '');

        if (frameText.length > 0) {
            framedContent = content.find('figure');
            if (framedContent.length === 0) {
                blockData.text = frameText;
            }
            else {
                blockData.images = {};
                blockData.text = frameText;
                framedContent.each(function(){ // replace all found figures with #id
                    var id = $(this).find('img').data('id');
                    blockData.images['row-' + id] = {};
                    var obj = {
                        id: $(this).find('img').data('id'),
                        legend: $(this).find('.legend').val(),
                        size: $(this).find('img').data('width')
                    };
                    if ($(this).find('img').parent().prop('tagName') === 'A'){
                        obj.link = $(this).find('img').parent().attr('href');
                    }
                    Object.assign(blockData.images['row-' + id], obj);

                    if ($(this).hasClass('f-left')) {
                        blockData.images['row-' + id].align = 'f-left';
                    }
                    else {
                        blockData.images['row-' + id].align = 'f-right';
                    }
                    $('.picture-' + id).parent().replaceWith('#' + id + ' ');
                    blockData.text = content.html();

                });
            }
        }

        Object.assign(this.blockStorage.data, blockData || {});
    },

    loadData: function(data){
        var self = this;
        // @todo investigate using another character for the placeholder
        var ids = data.text.match(/#\w+/g);

        this.imagesData = data.images;

        if (ids === null){
            return this.getTextBlock().html(stToHTML(data.text));
        }

        Object.keys(ids).forEach(function(value) {
            var val = ids[value].split('#')[1];

            var url = self.globalConfig.apiUrl + '/edt/media/' + val;

            /**
             * Callback function to fetch the blocks data from the API
             */

            xhr.get(url, {
                data: {
                    access_token: self.globalConfig.accessToken
                }
            })
            .then(function(result) {
                result.content = Object.assign(result.content, {
                    size: data.images['row-' + val].size,
                    legend: data.images['row-' + val].legend,
                    align: data.images['row-' + val].align
                });

                // @todo initialise the filteredBlock with all the data it needs
                var filteredBlock = subBlockManager.buildOne('filteredImage', null, null);

                filteredBlock.media = result.content;

                var renderedHTML = filteredBlock.renderBlock();

                data.text = data.text.replace('#' + val, renderedHTML);

                self.getTextBlock().html(data.text);

                // @todo the filteredImageBlock should contain this functionality
                if (data.images['row-' + val].link !== undefined) {
                    self.getTextBlock().find('img.picture-' + val).wrap('<a href="' + data.images['row-' + val].link + '"></a>');
                }

                filteredBlock.bindHover(self, filteredBlock);
            }).catch(function(error){
                console.error('Something went wrong');
            });

        });
        this.getTextBlock().html(stToHTML(data.text));

    },
    toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg, '$1');
    }
});
