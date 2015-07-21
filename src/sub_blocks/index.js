var $ = require('jquery');
var _ = require('../lodash.js');

/*
    Referred to as 'SubBlockManager' externally - this should be changed

    This file provides helper functions for creating and manipulating multiple 'sub blocks'
 */

var subBlockTypes = {
    embed: {
        personality: require('./jcs/personality.class.js'),
        poll: require('./jcs/poll.class.js'),
        quiz: require('./jcs/quiz.class.js'),
        script: require('./script.class.js')
    },
    media: {
        video: require('./media/video.class.js'),
        image: require('./media/image.class.js')
    },
    dynamicImage: require('./dynamic-image.class.js')
};

function buildSingleBlock(type, subType, contents) {
    if (typeof subBlockTypes[type][subType] === 'function') {
        return new subBlockTypes[type][subType](contents);
    }
    else if (typeof subBlockTypes[type] === 'function') {
        return new subBlockTypes[type](contents);
    }
    else {
      throw new Error('No matching type or subtype found for ' + type + ' and/or ' + subType);
    }
}

function handleClick(event) {
    if ($(event.target).hasClass('st-sub-block-link')) {
        window.open($target.attr('href'), '_blank');
    }
    else {
        var id = $(event.currentTarget).data('sub-block-id').toString();
        event.data.callback(id, event.currentTarget);
    }
}

var SubBlockManager = {

    bindEventsOnContainer: function(container, callback) {
        container.on('click', '[data-sub-block-id]', { callback: callback }, handleClick);
    },

    unBindEventsOnContainer: function(container) {
        container.off('click', handleClick);
    },

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

    render: function(subBlocks) {
        return subBlocks.map(function(subBlock) {
            return subBlock.renderSmall();
        });
    },

    buildSingle: buildSingleBlock,

    build: function(type, subType, contents) {
        return contents.map(function(singleContent) {
            return buildSingleBlock(type, subType, singleContent);
        });
    },
    buildOne: function(type, contents, subType) {
        return buildSingleBlock(type, contents, subType);
    }
};

module.exports = SubBlockManager;
