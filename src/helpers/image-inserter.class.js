var eventablejs = require('eventablejs');
var Modal = require('etudiant-mod-modal');
var FilterBar = requrie('./filterbar.class.js');
var Slider = require('./slider.class.js');
var $ = require('jquery');
var contentEditableHelper = require('./content-editable-helper.js');
var Zoom = require('etudiant-mod-zoom'); // do I need this?
var _ = require('../lodash.js');

var ImageInserter = function() {};

var prototype = {};

ImageInserter.prototype = Object.assign(prototype, eventablejs);

module.exports = ImageInserter;

