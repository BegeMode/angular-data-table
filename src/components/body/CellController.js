import { isOldAngular } from '../../utils/utils';

export default class CellController {
  /* @ngInject */
  constructor($scope) {
    Object.assign(this, {
      $scope,
    });

    if (isOldAngular()) {
      this.$onInit();
    }
  }

  $onInit() {
    this.init();
  }

  init() {
    if (this.options.treeToggleDblClick && this.column.isTreeColumn) {
      var self = this;
      this.listener = this.$scope.$on('rowDblClick', function (event, data) {
        if (data.index == self.row.$$index) {
          self.treeToggle();
        }
      });
      this.$scope.$on('$destroy', this.listener);
    }
  }
  /**
   * Calculates the styles for the Cell Directive
   * @return {styles object}
   */
  styles() {
    return {
      width: `${this.column.width}px`,
      'min-width': `${this.column.width}px`,
    };
  }

  /**
   * Calculates the css classes for the cell directive
   * @param  {column}
   * @return {class object}
   */
  cellClass() {
    const style = {
      'dt-tree-col': this.column.isTreeColumn,
    };

    if (this.column.className) {
      style[this.column.className] = true;
    }

    return style;
  }

  /**
   * Calculates the tree class styles.
   * @return {css classes object}
   */
  treeClass() {
    return {
      'dt-tree-toggle': true,
      'icon-right': !this.expanded,
      'icon-down': this.expanded,
      'icon-loading': this.loading  //bgmd
    };
  }

  /**
   * Invoked when the tree toggle button was clicked.
   * @param  {event}
   */
  onTreeToggled(evt) {
    evt.stopPropagation();
    this.treeToggle();
  }

  treeToggle() {
    this.expanded = !this.expanded;
    this.onTreeToggle({
      cell: {
        value: this.value,
        column: this.column,
        expanded: this.expanded,
      },
    });
  }

  /**
   * Invoked when the checkbox was changed
   * @param  {object} event
   */
  onCheckboxChanged(event) {
    event.stopPropagation();
    this.onCheckboxChange({ $event: event });
  }

  /**
   * Returns the value in its fomatted form
   * @return {string} value
   */
  getValue() {
    let val = this.column.cellDataGetter ?
      this.column.cellDataGetter(this.value) : this.value;

    if (angular.isUndefined(val) || val === null) {
      val = '';
    }

    return val;
  }

}
