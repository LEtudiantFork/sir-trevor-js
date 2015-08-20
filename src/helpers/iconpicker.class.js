var $               = require('jquery');
var _               = require('../lodash.js');
var CopyrightPicker = require('./copyright-picker.class.js');
var eventablejs     = require('eventablejs');
var FileUploader    = require('../extensions/file-uploader.js');
var i18n            = require('../i18n-stub.js');
var Modal           = require('etudiant-mod-modal');
var Slider          = require('./slider.class.js');
var xhr             = require('etudiant-mod-xhr');

var iconPickerHtml = [
'<div class="icon-picker"><div class="droppable st-block__upload-container">',
    i18n.t('blocks:illustrated:placeholder:drop'),
'</div></div>'
].join('\n');

function triggerChangeIllustratedPicture(iconPicker, pictureInformations){
    iconPicker.blockRef.imageId = pictureInformations.id;
    iconPicker.trigger('picture:change', pictureInformations);

    if (iconPicker.blockRef.$el.find('figure').find('img').attr('alt').length === 0) {
        iconPicker.copyrightPicker = new CopyrightPicker(iconPicker.blockRef);
        iconPicker.copyrightPicker.on('copyright:changed', function() {

            iconPicker.blockRef.addMessage(i18n.t('blocks:illustrated:placeholder:updated'), 'st-block-displaying-message');

            window.setTimeout(function() {
                iconPicker.blockRef.resetMessages();
            }, 3000);
        });
    }

    iconPicker.modal.close();
}

function bindClickOnIcons(block) {
    block.slider.$elem.on('click', 'img', function(){
        triggerChangeIllustratedPicture(block, {
            src: $(this).attr('src'),
            copyright: $(this).attr('alt'),
            id: $(this).data('id')
        });
    });
}

function getMedia(uploadedMediaUrl, iconPicker) {
    xhr.get(uploadedMediaUrl, {
        data: {
            access_token: iconPicker.accessToken
        }
    })
    .then(function(imageData){
        triggerChangeIllustratedPicture(iconPicker, {
            src: imageData.content.thumbnail,
            copyright: imageData.content.copyright,
            id: imageData.content.id
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

function onDrop(transferData, iconPicker) {

    var file = transferData.files[0];

    if (/image|video/.test(file.type)) {
        var uploadUrl = iconPicker.blockRef.globalConfig.apiUrl + '/' + iconPicker.blockRef.globalConfig.uploadUrl + '?' + 'access_token=' + this.globalConfig.accessToken;

        var fileUploader = new FileUploader(iconPicker.blockRef, uploadUrl);
        var uploadedMedia;
        iconPicker.blockRef.loading();

        //@todo fix this promise chain

        var uploadPromise = fileUploader.upload(file);

        uploadPromise.then(function(returnedData) {
            uploadedMedia = iconPicker.blockRef.globalConfig.apiUrl + '/edt/media/' + returnedData.idMedia;
        })
        .catch(function(err) {
            console.log(err);
        });

        uploadPromise.then(function() {
            iconPicker.blockRef.ready();
            iconPicker.modal.close();

            return getMedia(uploadedMedia, iconPicker);
        }).catch(function(err) {
            console.log(err);
        });

    }
}

function createDropzone(iconPicker) {
    iconPicker.blockRef.$editor.$dropzone = $(iconPicker.modal.$elem.children('.droppable')[0]); // assign dropzone to an area
    iconPicker.blockRef.$editor.$dropzone.dropArea().bind('drop', function(ev){
        ev.preventDefault();
        ev = ev.originalEvent;

        onDrop(ev.dataTransfer, iconPicker);
        iconPicker.blockRef.$editor.$dropzone.dropArea().unbind('drop');
    });

}

function createArrayOfIcons(icons) {
    var iconsArray = [];
    icons.forEach(function(icon) {
        var file = icon.file.replace('original', '90x90');
        var single = _.template('<img data-id=<%= id %> src="<%= icon %>" alt="<%= alt %>" >', { icon: file, alt: icon.copyright, id: icon.id });
        iconsArray.push(single);
    });
    return iconsArray;
}

function getIcons(iconPicker) {

    // @todo how does this retrieve just icons (and not the whole mediatheque) ?
    xhr.get(iconPicker.apiUrl + '/edt/media', {
        data: {
            access_token: iconPicker.accessToken,
            application: iconPicker.application,
            type: 'image',
            limit: 20
        }
    })
    .then(function(iconData) {
        var iconsArray = createArrayOfIcons(iconData.content);

        var modalInner = iconPicker.modal.$elem.children('.modal-content')[0];

        if (iconPicker.modal.$elem.children('.icon-picker') === false) {
            $(modalInner).append(iconPickerHtml);
        }
        createDropzone(iconPicker);

        iconPicker.modal.open();

        if (iconPicker.slider === undefined) {
            var params = {
                contents: iconsArray,
                itemsPerSlide: 5,
                increment: 1,
                container: $(modalInner),
                controls: {
                    next: i18n.t('blocks:illustrated:modal:next'),
                    prev: i18n.t('blocks:illustrated:modal:prev')
                }
            };

            iconPicker.slider = new Slider(params); //@TODO  Teach the slider how to handle native element & jquery elements;

            iconPicker.slider.on('progress', function() {
                var offset = iconPicker.slider.currentIndex * iconPicker.slider.config.itemsPerSlide;

                xhr.get(iconPicker.apiUrl + '/edt/media', {
                    data: {
                        application: iconPicker.application,
                        type: 'image',
                        limit: 20,
                        offset: offset,
                        access_token: iconPicker.accessToken
                    }
                })
                .then(function(updatedIconData) {
                    iconsArray = createArrayOfIcons(updatedIconData.content);
                    iconPicker.slider.update(iconsArray);
                })
                .catch(function(err){
                    console.log(err);
                });
            });
        }

        bindClickOnIcons(iconPicker);
    })
    .catch(function(err) {
        console.log(err);
        console.error('Somehting went wrong'); // what a helpful error message...
    });
}

var IconPicker = function(param) {
    this.init(param);
};

var prototype = {

    init: function(param) {
        var self = this;

        this.apiUrl = param.apiUrl;
        this.application = param.application;
        this.accessToken = param.accessToken;
        this.blockRef = param.blockRef;
        this.modalTriggerElement = param.modalTriggerElement;

        this.modal = new Modal({
            slug: 'icons-modal',
            animation: 'fade'
        });

        this.modal.render({
            header: '<header>' + i18n.t('blocks:illustrated:modal:header') + '</header>',

            content: '',

            footer: {
                ok: i18n.t('blocks:illustrated:modal:close')
            }
        });

        this.modalTriggerElement.on('click', function(e) {
            e.stopPropagation();

            if ($(this).children().length < 2) {
                getIcons(self);
            }
        });

        this.modalTriggerElement.on('click', 'img', function(e) {
            e.stopPropagation();
            getIcons(self);
        });
    },

    destroy: function() {
        this.modal.destroy();
        this.prototype = null;
    }

};

IconPicker.prototype = Object.assign({}, prototype, eventablejs);

module.exports = IconPicker;
