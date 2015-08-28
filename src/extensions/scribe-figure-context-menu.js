/**
 * Right click context menu to perform write operations on a table.
 */

// Actions supported by the context menu
var FIGURE_ACTIONS = [
    {
        id: 0,
        text: 'Supprimer l\'image'
    },
    {
        id: 1,
        text: 'Editer l\'image'
    }
];

var CONTEXT_MENU_CLASS = 'scribe-context-menu';
var CONTEXT_MENU_ACTION_CLASS = 'scribe-context-menu-action';

var getOffset = function(el) {
    var top = 0;
    var left = 0;

    while (el) {
        top += el.offsetTop;
        left += el.offsetLeft;

        if (el !== document.body) {
            top -= el.scrollTop;
        }

        el = el.offsetParent;
    }

    return {
        top: top,
        left: left
    };
};

var FigureContextMenu = function(scribe) {

    /**
     * Show right click context menu.
     * @param {HTMLElement} table Table element
     * @param {HTMLElement} tableCell Target cell of the right click.
     */
    this.show = function(figure) {
        this.hide();

        var menu = document.createElement('div');
        var offset = getOffset(figure);

        menu.className = CONTEXT_MENU_CLASS;
        menu.style.top = offset.top + 20 + 'px';
        menu.style.left = offset.left + 20 + 'px';

        FIGURE_ACTIONS.forEach(function(action) {
            var option = document.createElement('div');
            option.className = CONTEXT_MENU_ACTION_CLASS;
            option.textContent = action.text;

            option.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                this.handleAction(figure, action);
            }.bind(this));

            menu.appendChild(option);
        }.bind(this));

        document.body.appendChild(menu);

        document.addEventListener('click', function(event) {
            // ignore right click from the contextmenu event.
            if (event.which !== 3) {
                this.hide();
            }
        }.bind(this));
    };

    /**
     * Hide right click context menu.
     */
    this.hide = function() {
        var menu = document.getElementsByClassName(CONTEXT_MENU_CLASS)[0];
        if (menu) {
            menu.parentNode.removeChild(menu);
        }

        document.removeEventListener('click', this.hide);
    };

    /**
     * Handle action selection from the context menu.
     */
    this.handleAction = function(figure, action) {
        this.hide();

        switch (action.id) {
            case 0:
                scribe.eventBus.trigger('deleteFigure', figure);
                break;
            case 1:
                scribe.eventBus.trigger('editFigure', figure);
                break;
        }
    };

    return this;
};

module.exports = FigureContextMenu;
