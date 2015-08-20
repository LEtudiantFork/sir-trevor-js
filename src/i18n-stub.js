var _ = require('./lodash');
var config = require('./config');
var Locales = require('./locales.js');
var utils = require('./utils');

// Minimal i18n stub that only reads the English strings
module.exports = {
    t: function(key, options) {
        var parts = key.split(':');
        var str;
        var obj;
        var part;
        var i;

        obj = Locales[config.language];

        for (i = 0; i < parts.length; i++) {
            part = parts[i];

            if (!_.isUndefined(obj[part])) {
                obj = obj[part];
            }
        }

        str = obj;

        if (!_.isString(str)) {
            utils.log('Missing i18n reference for ', key);
            return '';
        }

        if (str.indexOf('__') >= 0) {
            Object.keys(options).forEach(function(opt) {
                str = str.replace('__' + opt + '__', options[opt]);
            });
        }

        return str;
    }
};
