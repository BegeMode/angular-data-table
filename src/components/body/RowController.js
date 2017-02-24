import { DeepValueGetter } from '../../utils/utils';
import TranslateXY from '../../utils/translate';

export default class RowController {

  /**
   * Returns the value for a given column
   * @param  {col}
   * @return {value}
   */
  getValue(col) {
    if (!col.prop) return '';
    return DeepValueGetter(this.row, col.prop);
  }

  /**
   * Invoked when a cell triggers the tree toggle
   * @param  {cell}
   */
  onTreeToggled(cell) {
    this.onTreeToggle({
      cell,
      row: this.row,
    });
  }

  /**
   * Calculates the styles for a pin group
   * @param  {group}
   * @return {styles object}
   */
  stylesByGroup(group) {
    const styles = {
      width: `${this.columnWidths[group]}px`,
    };

    if (group === 'left') {
      TranslateXY(styles, this.options.internal.offsetX, 0);
    } else if (group === 'right') {
      const offset = (((this.columnWidths.total - this.options.internal.innerWidth) -
        this.options.internal.offsetX) + this.options.internal.scrollBarWidth) * -1;
      TranslateXY(styles, offset, 0);
    }

    return styles;
  }

  /**
   * Invoked when the cell directive's checkbox changed state
   */
  onCheckboxChanged(ev) {
    this.onCheckboxChange({
      $event: ev,
      row: this.row,
    });
  }

  /** bgmd
   *
   */
  getChanges() {
    if (!this.row._original)
      return null;
    let result = {};
    for (var prop in this.row._original) {
      if (this.row._original.hasOwnProperty(prop)) {
        let value = this.row._original[prop];
        if (value !== this.row[prop])
          result[prop] = this.row[prop];
      }
    }
    return Object.keys(result).length == 0? null : result;
  }

  submitChanges() {
    if (!this.row._original)
      return;
    let result = {};
    for (var prop in this.row._original) {
      if (this.row._original.hasOwnProperty(prop)) {
        this.row._original[prop] = this.row[prop];
      }
    }
  }
}
