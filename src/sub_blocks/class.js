var eventablejs = require('eventablejs');

var Basic        = require('./types/basic.js');
var Script       = require('./types/script.js');
var BasicMedia   = require('./types/media/basic-media.js')
var Image        = require('./types/media/image.js');
var Video        = require('./types/media/video.js');
var Diaporama    = require('./types/media/diaporama.js');
var DynamicImage = require('./types/media/dynamic-image.js');
var BasicJcs     = require('./types/jcs/basic-jcs.js');
var Personality  = require('./types/jcs/personality.js');
var Poll         = require('./types/jcs/poll.js');
var Quiz         = require('./types/jcs/quiz.js');

module.exports = {
    create: function(params) {
        var instance = {};

        switch (params.type) {
        case 'image':
            instance = Object.assign(instance, Basic.prototype, BasicMedia.prototype, eventablejs);

            Basic.init.call(instance, params);
            Image.init.call(instance);
            break;
        case 'video':
            instance = Object.assign(instance, Basic.prototype, BasicMedia.prototype, Video.prototype, eventablejs);

            Basic.init.call(instance, params);
            Video.init.call(instance);
            break;
        case 'diaporama':
            instance = Object.assign(instance, Basic.prototype, BasicMedia.prototype, Diaporama.prototype, eventablejs);

            Basic.init.call(instance, params);
            Diaporama.init.call(instance);
            break;
        case 'dynamicImage':
            instance = Object.assign(instance, Basic.prototype, BasicJcs.prototype, DynamicImage.prototype, eventablejs);

            Basic.init.call(instance, params);
            DynamicImage.init.call(instance);
            break;
        case 'poll':
            instance = Object.assign(instance, Basic.prototype, BasicJcs.prototype, Poll.prototype, eventablejs);

            Basic.init.call(instance, params);
            BasicJcs.init.call(instance);
            break;
        case 'quiz':
            instance = Object.assign(instance, Basic.prototype, BasicJcs.prototype, Quiz.prototype, eventablejs);

            Basic.init.call(instance, params);
            BasicJcs.init.call(instance);
            break;
        case 'personality':
            instance = Object.assign(instance, Basic.prototype, BasicJcs.prototype, Personality.prototype, eventablejs);

            Basic.init.call(instance, params);
            BasicJcs.init.call(instance);
            break;
        case 'script':
            instance = Object.assign(instance, Script.prototype, eventablejs);

            Script.init.call(instance, params);
            break;
        }

        return instance;
    }
};
