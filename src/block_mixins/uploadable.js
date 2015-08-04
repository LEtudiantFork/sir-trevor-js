var $ = require('jquery');
var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

var FileUploader = require('../extensions/file-uploader');

module.exports = {

    mixinName: 'Uploadable',

    uploadsCount: 0,

    initializeUploadable: function() {
        utils.log('Adding uploadable to block ' + this.blockID);
        this.withMixin(require('./ajaxable'));

        this.upload_options = Object.assign({}, config.defaults.Block.upload_options, this.upload_options);

        this.$uploader = $(_.template(this.upload_options.html, this));
        this.$inputs.append(this.$uploader);

        this.$uploader.find('button').bind('click', function(ev) {
            ev.preventDefault();
        });

        var fullUrl = this.globalConfig.apiUrl + '/' + this.globalConfig.uploadUrl + '?' + 'access_token=' + this.globalConfig.accessToken;

        this.uploader = new FileUploader(this, fullUrl);
    }
};
