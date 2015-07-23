var $ = require('jquery');
var _ = require('../lodash.js');

/*
    Referred to as 'SubBlockManager' externally - this should be changed

    This file provides helper functions for creating and manipulating multiple 'sub blocks'
 */

var subBlockTypes = {
    personality: require('./jcs/personality.class.js'),
    poll: require('./jcs/poll.class.js'),
    quiz: require('./jcs/quiz.class.js'),
    script: require('./script.class.js'),
    video: require('./media/video.class.js'),
    image: require('./media/image.class.js'),
    dynamicImage: require('./dynamic-image.class.js')
};

var SubBlockManager = {

    // given an array of sub blocks, retrieves the one that matches the passed id
    getSubBlockById: function(id, subBlocks) {
        var retrievedSubBlock;

        subBlocks.some(function(subBlock) {
            if (subBlock.id.toString() === id.toString()) {
                retrievedSubBlock = subBlock;
                return true;
            }
        });

        if (retrievedSubBlock) {
            return retrievedSubBlock;
        }

        return false;
    },

    // renders multiple sub blocks
    render: function(subBlocks) {
        return subBlocks.map(function(subBlock) {
            return subBlock.renderSmall();
        });
    },

    // builds multiple sub blocks
    build: function(params) {
        return params.contents.map(function(singleContent) {
            return this.buildSingle({
                accessToken: params.accessToken,
                apiUrl: params.apiUrl,
                application: params.application,
                content: singleContent,
                parentId: params.parentId,
                type: params.type
            });
        }.bind(this));
    },

    // build a single sub block
    buildSingle: function(params) {
        if (subBlockTypes[params.type]) {
            return new subBlockTypes[params.type](params);
        }
        else {
          throw new Error('No matching type found for ' + params.type);
        }
    }

};

module.exports = SubBlockManager;
