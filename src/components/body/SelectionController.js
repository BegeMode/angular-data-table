import KEYS from '../../utils/keys';
import { isOldAngular } from '../../utils/utils';

export default class SelectionController {

  /* @ngInject*/
  constructor($scope) {
    this.$scope = $scope;
    this.body = $scope.body;
    this.options = $scope.body.options;
    this.selected = $scope.body.selected;

    if (isOldAngular()) {
      this.$onInit();
    }
  }

  $onInit() {
    this.init();
  }

  init() {
    this.checkedRows = this.body.checkedRows;
    if (this.options && this.options.columns) {
      this.hasTreeColumn = this.options.columns.find(c => c.isTreeColumn) != null;
    }
  }

  /**
   * Handler for the keydown on a row
   * @param  {event}
   * @param  {index}
   * @param  {row}
   */
  keyDown(ev, index, row) {
    if (KEYS[ev.keyCode]) {
      ev.preventDefault();
    }

    if (ev.keyCode === KEYS.DOWN) {
      const next = ev.target.nextElementSibling;
      if (next) {
        next.focus();
      }
    } else if (ev.keyCode === KEYS.UP) {
      const prev = ev.target.previousElementSibling;
      if (prev) {
        prev.focus();
      }
    } else if (ev.keyCode === KEYS.RETURN) {
      this.selectRow(index, row);
    }
  }

  /**
   * Handler for the row click event
   * @param  {object} event
   * @param  {int} index
   * @param  {object} row
   */
  rowClicked(event, index, row) {
    if (!this.options.checkboxSelection) {
      // event.preventDefault();
      this.selectRow(event, index, row);
    }

    this.body.onRowClick({ row });
  }

  /**
   * Handler for the row double click event
   * @param  {object} event
   * @param  {int} index
   * @param  {object} row
   */
  rowDblClicked(event, index, row) {
    if (!this.options.checkboxSelection) {
      event.preventDefault();
      this.selectRow(event, index, row);
    }
    if (this.options.treeToggleDblClick && this.hasTreeColumn) {
      this.$scope.$broadcast('rowDblClick', {
        row,
        index,
      });
    }
    this.body.onRowDblClick({ row });
  }

  /**
   * Invoked when a row directive's checkbox was changed.
   * @param  {index}
   * @param  {row}
   */
  onCheckboxChange(event, index, row) {
    // this.selectRow(event, index, row);
    this.checkRow(row);
    // if tree check subtrees
    if (this.hasTreeColumn && this.options.autoCheckSubNodes) {
      const state = this.getCheckState(row);
      this.checkSubNodes(row, state);
    }
  }

  getCheckState(row) {
    if (!row || !this.checkedRows) {
      return false;
    }
    let checked = this.checkedRows.get(row);
    if (!checked) {
      checked = false;
    }
    return checked;
  }

  checkRow(row, check) {
    if (!row) {
      return;
    }
    const checked = angular.isDefined(check) ? check : !this.getCheckState(row);
    this.checkedRows.set(row, checked);
    row._checked = checked;
    /* if (angular.isDefined(check)) {
      this.checkedRows.set(row, check);
    } else {
      const checked = this.getCheckState(row);
      this.checkedRows.set(row, !checked);
    }*/
  }

  checkSubNodes(row, checkState) {
    if (!row) {
      return;
    }
    if (row) {
      if (row.$$children) {
        row.$$children.forEach((child) => {
          const { row: r } = this.body.getRowInTree(child);
          this.checkRow(r, checkState);
          this.checkSubNodes(r, checkState);
        });
      }
    }
  }

  isChecked(row) {
    return this.getCheckState(row);
  }

  /**
   * Selects a row and places in the selection collection
   * @param  {index}
   * @param  {row}
   */
  selectRow(event, index, row) {
    if (this.options.selectable) {
      if (this.options.multiSelect) {
        const isShiftKeyDown = event.shiftKey;

        if (isShiftKeyDown) {
          this.selectRowsBetween(index, row);
        } else {
          const idx = this.selected.indexOf(row);
          if (idx > -1) {
            this.selected.splice(idx, 1);
          } else {
            if (this.options.multiSelectOnShift && this.selected.length === 1) {
              this.selected.splice(0, 1);
            }
            this.selected.push(row);
            this.body.onSelect({ rows: [row] });
          }
        }
        this.prevIndex = index;
      } else {
        this.selected = row;
        this.body.onSelect({ rows: [row] });
      }
    }
  }

  /**
   * Selects the rows between a index.  Used for shift click selection.
   * @param  {index}
   */
  selectRowsBetween(index) {
    const reverse = index < this.prevIndex;
    const selecteds = [];

    for (let i = 0, len = this.body.rows.length; i < len; i += 1) {
      const row = this.body.rows[i];
      const greater = i >= this.prevIndex && i <= index;
      const lesser = i <= this.prevIndex && i >= index;

      let range = {};
      if (reverse) {
        range = {
          start: index,
          end: (this.prevIndex - index),
        };
      } else {
        range = {
          start: this.prevIndex,
          end: index + 1,
        };
      }

      if ((reverse && lesser) || (!reverse && greater)) {
        const idx = this.selected.indexOf(row);
        // if reverse shift selection (unselect) and the
        // row is already selected, remove it from selected
        if (reverse && idx > -1) {
          this.selected.splice(idx, 1);

          // if in the positive range to be added to `selected`, and
          // not already in the selected array, add it
        } else if (i >= range.start &&
            i < range.end &&
            idx === -1) {
          this.selected.push(row);
          selecteds.push(row);
        }
      }

      this.body.onSelect({ rows: selecteds });
    }
  }
}
