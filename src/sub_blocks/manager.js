var $ = require('jquery');
var _ = require('../lodash.js');

/*
    This file provides helper functions for creating and manipulating multiple 'sub blocks'
 */

var SubBlockClass = require('./class.js');

var SubBlockManager = {

    getSubBlockByID: function(subBlockArray, id) {
        return subBlockArray.filter(function(subBlock) {
            return subBlock.id.toString() === id.toString();
        })[0];
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
                parentID: params.parentID,
                type: params.type
            });
        }.bind(this));
    },

    // build a single sub block
    buildSingle: function(params) {
        return SubBlockClass.create(params);
    }

};

module.exports = SubBlockManager;
