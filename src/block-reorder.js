'use strict';

var dropEvents = require('./helpers/drop-events');

var EventBus = require('./event-bus');
var Dom = require('./packages/dom');

var BlockReorder = function(block_element, mediator) {
    this.block = block_element;
    this.blockID = this.block.getAttribute('id');
    this.mediator = mediator;

    this._ensureElement();
    this._bindFunctions();

    this.initialize();
};

Object.assign(BlockReorder.prototype, require('./function-bind'), require('./renderable'), {

    bound: ['onMouseDown', 'onDragStart', 'onDragEnd', 'onDrop'],

    className: 'st-block-ui-btn__reorder',
    tagName: 'a',

    attributes: function() {
        return {
            'html': '<div class="st-icon-drag">&middot;</div>',
            'draggable': 'true',
            'data-icon': 'move'
        };
    },

    initialize: function() {
        this.el.addEventListener('mousedown', this.onMouseDown);
        this.el.addEventListener('dragstart', this.onDragStart);
        this.el.addEventListener('dragend', this.onDragEnd);

        dropEvents.dropArea(this.block);
        this.block.addEventListener('drop', this.onDrop);
    },

    blockId: function() {
        return this.block.getAttribute('id');
    },

    onMouseDown: function() {
        EventBus.trigger('block:reorder:down');
    },

    onDrop: function(ev) {
        ev.preventDefault();

        var dropped_on = this.block;
        var item_id = ev.dataTransfer.getData('text/plain');
        var block = document.querySelector('#' + item_id);

        if (!!item_id, !!block, dropped_on.id !== item_id) {
            Dom.insertAfter(block, dropped_on);
        }
        this.mediator.trigger('block:rerender', item_id);
        EventBus.trigger('block:reorder:dropped', item_id);
    },

    onDragStart: function(ev) {
        var block = this.block;

        this.dragEl = block.cloneNode(true);
        this.dragEl.classList.add('st-drag-element');
        this.dragEl.style.top = `${block.offsetTop}px`;
        this.dragEl.style.left = `${block.offsetLeft}px`;

        ev.dataTransfer.setDragImage(this.dragEl, 0, 0);
        ev.dataTransfer.setData('text/plain', this.blockId());
        this.mediator.trigger('block-controls:hide');

        EventBus.trigger('block:reorder:dragstart');
        block.classList.add('st-block--dragging');
    },

    onDragEnd: function(ev) {
        EventBus.trigger('block:reorder:dragend');
        this.block.classList.remove('st-block--dragging');
    },

    render: function() {
        return this;
    }
});

module.exports = BlockReorder;
