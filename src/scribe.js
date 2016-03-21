/**
    Why this file?

    Scribe and its plugins are built with AMD. Madebymany solved the difficulty of mixing AMD with a CommonJS environment by switching
    Browserify for Webpack. We don't want to do that because we're quite happy with Browserify thank you very much.

    So, we have added a build script to create a bundle from this file. The bundle has to be standalone so it can be deamdified and derequired.
*/

var Scribe = require('scribe-editor');

var scribePluginFormatterPlainTextConvertNewLinesToHTML = require('scribe-plugin-formatter-plain-text-convert-new-lines-to-html');
var scribePluginLinkPromptCommand                       = require('scribe-plugin-link-prompt-command');
var scribePluginSanitizer                               = require('scribe-plugin-sanitizer');
var scribePluginHeadingCommand                          = require('scribe-plugin-heading-command');
var scribeTableCommand                                  = require('scribe-plugin-table-command');

module.exports = {
    Scribe: Scribe,
    scribePluginFormatterPlainTextConvertNewLinesToHTML: scribePluginFormatterPlainTextConvertNewLinesToHTML,
    scribePluginLinkPromptCommand: scribePluginLinkPromptCommand,
    scribePluginSanitizer: scribePluginSanitizer,
    scribePluginHeadingCommand: scribePluginHeadingCommand,
    scribeTableCommand: scribeTableCommand
};
