/**
 * Right click context menu to perform write operations on a table.
 */

var TableUtils = require('./TableUtils');

// Actions supported by the context menu
var TABLE_ACTIONS = [{
  id: 0,
  text: 'Ajouter un rang au-dessus'
},
{
  id: 1,
  text: 'Ajouter un rang au-dessous'
},
{
  id: 2,
  text: 'Ajouter une colonne à gauche'
},
{
  id: 3,
  text: 'Ajouter une colonne à droite'
},
{
  id: 4,
  text: 'Supprimer le rang'
},
{
  id: 5,
  text: 'Supprimer la colonne'
},
{
  id: 6,
  text: 'Supprimer la table'
}];

var CONTEXT_MENU_CLASS = 'scribe-table-context-menu';
var CONTEXT_MENU_ACTION_CLASS = 'scribe-table-context-menu-action';

var getOffset = function(el) {
  var top = 0;
  var left = 0;

  while (el) {
    top += el.offsetTop;
    left += el.offsetLeft;
    el = el.offsetParent;
  }

  return {
    top: top,
    left: left
  };
};

var TableContextMenu = function(scribe) {

  /**
   * Show right click context menu.
   * @param {HTMLElement} table Table element
   * @param {HTMLElement} tableCell Target cell of the right click.
   */
  this.show = function(table, tableCell) {
    this.hide();

    var menu = document.createElement('div');
    var offset = getOffset(tableCell);

    menu.className = CONTEXT_MENU_CLASS;
    menu.style.top = offset.top + 20 + 'px';
    menu.style.left = offset.left + 20 + 'px';

    TABLE_ACTIONS.forEach(function(action) {
      var option = document.createElement('div');
      option.className = CONTEXT_MENU_ACTION_CLASS;
      option.innerText = action.text;

      option.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        this.handleAction(table, tableCell, action);
      }.bind(this));

      menu.appendChild(option);
    }.bind(this));

    document.body.appendChild(menu);
    document.addEventListener('click', this.hide);
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
   * @param {HTMLElement} table Table element
   * @param {HTMLElement} tableCell Table cell that was the target of the right click
   * @param {object} action Table Action from TABLE_ACTIONS
   */
  this.handleAction = function(table, tableCell, action) {
    var cellPosition = TableUtils.findCellPosition(table, tableCell);
    this.hide();

    switch (action.id) {
      case 0:
        TableUtils.insertRow(scribe, table, cellPosition.rowIndex);
        break;
      case 1:
        TableUtils.insertRow(scribe, table, cellPosition.rowIndex + 1);
        break;
      case 2:
        TableUtils.insertColumn(scribe, table, cellPosition.columnIndex);
        break;
      case 3:
        TableUtils.insertColumn(scribe, table, cellPosition.columnIndex + 1);
        break;
      case 4:
        TableUtils.removeRow(scribe, table, cellPosition.rowIndex);
        break;
      case 5:
        TableUtils.removeColumn(scribe, table, cellPosition.columnIndex);
        break;
      case 6:
        TableUtils.removeTable(scribe, table);
        break;
    }
  };

  return this;
};

module.exports = TableContextMenu;
