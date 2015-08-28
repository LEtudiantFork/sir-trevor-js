/**
 * Scribe Figure Command - hacky copy of Scribe Table Command: to be cleaned up and improved.
 */

var eventablejs = require('eventablejs');

function findFigure(scribe, el) {
    while (el && el !== scribe.el && el.nodeName !== 'FIGURE') {
        el = el.parentNode;
    }

    if (el && el.nodeName !== 'FIGURE') {
        el = null;
    }

    return el;
}

/**
 * Find block container for the given element.
 * @param {HTMLElement} el
 */
function findBlockContainer(scribe, el) {
    while (el && !scribe.element.isBlockElement(el)) {
        el = el.parentNode;
    }

    return el;
}

var FigureContextMenu = require('./scribe-figure-context-menu.js');

module.exports = function() {
    return function(scribe) {
        // @todo separation of concerns
        scribe.eventBus = Object.assign({}, eventablejs);

        var figureCommand = new scribe.api.Command('insertFigure');
        var contextMenu = new FigureContextMenu(scribe);

        figureCommand.nodeName = 'FIGURE';

        figureCommand.execute = function(elem) {
            var figureElement = elem;

            scribe.transactionManager.run(function() {
                var selection = new scribe.api.Selection();

                var el = findBlockContainer(scribe, selection.range.endContainer);
                var nextElement = el.nextSibling;

                if (nextElement) {
                    scribe.el.insertBefore(figureElement, nextElement);
                }

                else {
                    scribe.el.appendChild(figureElement);
                }
            });
        };

        figureCommand.queryState = function() {
            var selection = new scribe.api.Selection();
            return selection.getContaining(function(node) {
                return (node.nodeName === this.nodeName);
            }.bind(this));
        };

        figureCommand.queryEnabled = function() {
            return true;
        };

        /**
         * Handle right click inside the scribe editor.
         */
        function handleRightClick(event) {
            var target = event.target || event.toElement;

            if (!target) {
                return;
            }

            var figure = findFigure(scribe, target);

            if (figure) {
                event.preventDefault();
                event.stopPropagation();
                contextMenu.show(figure);
            }
        }

        scribe.el.addEventListener('contextmenu', handleRightClick);

        scribe.commands.insertFigure = figureCommand;
    };
};
