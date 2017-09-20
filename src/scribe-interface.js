'use strict';

var _ = require('./lodash');
var config = require('./config');

var scribeBuild = require('./scribe.build.js');

var sanitizeDefaults = {
    p: false,
    h1: true,
    h2: true,
    h3: true,
    a: {
        href: true,
        target: '_blank',
        rel: true
    },
    i: true,
    b: true,
    strong: false,
    em: true
};

module.exports = {

    initScribeInstance: function(el, scribeOptions, configureScribe) {

        scribeOptions = scribeOptions || {};

        var scribeConfig = {debug: config.scribeDebug};
        var tags = sanitizeDefaults;

        if (_.isObject(scribeOptions)) {
            scribeConfig = Object.assign(scribeConfig, scribeOptions);
        }

        var scribe = new scribeBuild.Scribe(el, scribeConfig);

        if (scribeOptions.hasOwnProperty("tags")) {
            tags = Object.assign(sanitizeDefaults, scribeOptions.tags);
        }

        scribe.use(scribeBuild.scribePluginFormatterPlainTextConvertNewLinesToHTML());
        scribe.use(scribeBuild.scribePluginLinkPromptCommand());
        scribe.use(scribeBuild.scribePluginSanitizer({ tags: tags }));

        if (_.isFunction(configureScribe)) {
            configureScribe.call(this, scribe);
        }

        return scribe;
    },

    execTextBlockCommand: function(scribeInstance, cmdName) {
        if (_.isUndefined(scribeInstance)) {
            throw "No Scribe instance found to query command";
        }

        var cmd = scribeInstance.getCommand(cmdName);
        scribeInstance.el.focus();
        return cmd.execute();
    },

    queryTextBlockCommandState: function(scribeInstance, cmdName) {
        if (_.isUndefined(scribeInstance)) {
            throw "No Scribe instance found to query command";
        }

        var cmd = scribeInstance.getCommand(cmdName),
                sel = new scribeInstance.api.Selection();
        return sel.range && cmd.queryState();
    },
};
