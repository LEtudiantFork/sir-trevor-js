"use strict";

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

var fileUploader = require('../extensions/file-uploader');

module.exports = {

    mixinName: 'Uploadable',

    uploadsCount: 0,
    requireInputs: true,

    initializeUploadable: function() {
        utils.log('Adding uploadable to block ' + this.blockID);
        this.withMixin(require('./ajaxable'));

        this.upload_options = Object.assign({}, config.defaults.Block.upload_options, this.upload_options);
        this.inputs.insertAdjacentHTML('beforeend', _.template(this.upload_options.html, this));
    },

    uploader: function(file, success, failure){
    	// @todo reimplement
        return fileUploader(this, file, success, failure);
    }
};
