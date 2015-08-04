/*
 *   Sir Trevor Uploader
 *   Generic Upload implementation that can be extended for blocks
 */

var _ = require('../lodash');
var $ = require('jquery');
var config = require('../config');
var utils = require('../utils');

var EventBus = require('../event-bus');

var FileUploader = function() {
    this.init.apply(this, arguments);
};

FileUploader.prototype = {
    init: function(block, uploadUrl) {
        this.blockRef = block;
        this.uploadUrl = uploadUrl;
    },

    upload: function(file) {
        var self = this;

        EventBus.trigger('onUploadStart');

        var uid = [self.blockRef.blockID, (new Date()).getTime(), 'raw'].join('-');

        var data = new FormData();

        data.append('attachment[name]', file.name);
        data.append('qqfiles', file);
        data.append('attachment[uid]', uid);
        data.append('application', 'ETU_ETU');

        self.blockRef.resetMessages();

        var xhr = $.ajax({
            url: self.uploadUrl,
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'json',
            type: 'POST'
        });

        var uploadPromise = function(resolve, reject) {
            xhr.done(function(uploadData) {
                utils.log('Upload callback called');
                EventBus.trigger('onUploadStop');

                self.blockRef.removeQueuedItem.bind(self.blockRef, uid);

                resolve(uploadData);
            })
            .fail(function(error) {
                utils.log('Upload callback error called');
                EventBus.trigger('onUploadStop');

                self.blockRef.removeQueuedItem.bind(self.blockRef, uid);

                reject(error);
            });
        };

        return new Promise(uploadPromise);
    }
};

module.exports = FileUploader;
