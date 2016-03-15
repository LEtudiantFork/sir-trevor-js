/**
    Why this file?

    Scribe and its plugins are built with AMD. Madebymany solved the difficulty of mixing AMD with a CommonJS environment by switching
    Browserify for Webpack. We don't want to do that because we're quite happy with Browserify thank you very much.

    So, we have added some npm scripts which do the following :

    - bundle this file with deamdify so we remove the calls to define() (yuck!)
    - run derequire on the resulting bundle to remove the references to require(), because otherwise when we require() it from the app, the require()
        in our app will try and parse the bundled files, which are no longer available.
    - we can then require this derequired, deamdified, browserified bundle.

    On the way, we have to hotfix one of the scribe plugins' dependencies (html-janitor) because for some reason deamdify doesn't manage to parse it. I think it's
    because it's in the UMD format not AMD so it dies.

    Though this might seem like a bit of a heavy-handed approach, it responds to our main need which is to keep getting updates for Scribe.
*/

var Scribe = require('scribe-editor');

var scribePluginFormatterPlainTextConvertNewLinesToHTML = require('scribe-plugin-formatter-plain-text-convert-new-lines-to-html');
var scribePluginLinkPromptCommand = require('scribe-plugin-link-prompt-command');
var scribePluginSanitizer = require('scribe-plugin-sanitizer');
var scribePluginHeadingCommand = require('scribe-plugin-heading-command');

module.exports = {
    Scribe: Scribe,
    scribePluginFormatterPlainTextConvertNewLinesToHTML: scribePluginFormatterPlainTextConvertNewLinesToHTML,
    scribePluginLinkPromptCommand: scribePluginLinkPromptCommand,
    scribePluginSanitizer: scribePluginSanitizer,
    scribePluginHeadingCommand: scribePluginHeadingCommand
};
