import { isOldAngular } from '../../utils/utils';

const TREE_TYPES = {
  GROUP: 'refreshGroups',
  TREE: 'refreshTree',
};

export default class BodyController {
  /**
   * A body controller
   * @param  {$scope}
   * @return {BodyController}
   */

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
    this.tempRows = [];
    this.watchListeners = [];
    // bgmd
    if (this.options.checkboxSelection) {
      this.checkedRows = new Map();
    }
    this.loading = {};
    this.setTreeAndGroupColumns();
    this.setConditionalWatches();

    this.$scope.$watch('body.options.columns', (newVal, oldVal) => {
      if (newVal) {
        const filter = this.filterChanged();
        if (filter) {
          if (this.treeColumn || this.groupColumn) {
            this._applyFilter = filter;
            this.rowsUpdated();
          } else {
            this.rows = this.doFilter(filter);
          }
          return;
        }
        this.rows = this.doFilter();

        const origTreeColumn = angular.copy(this.treeColumn);
        const origGroupColumn = angular.copy(this.groupColumn);

        this.setTreeAndGroupColumns();

        this.setConditionalWatches();


        if ((this.treeColumn && origTreeColumn !== this.treeColumn) ||
          (this.groupColumn && origGroupColumn !== this.groupColumn)) {
          this.rowsUpdated(this.rows);

          if (this.treeColumn) {
            this.refreshTree();
          } else if (this.groupColumn) {
            this.refreshGroups();
          }
        }
        if (BodyController.isColumnsReordered(newVal, oldVal)) {
          this.headerReordered();
        } else if (BodyController.isAddOrRemoveColumns(newVal, oldVal)) {
          this.createFilters(true);
        } else {
          this.createFilters();
        }
      }
    }, true);

    const self = this;
    this.$scope.$watchCollection('body.rows', (newVal, oldVal) => { // this.rowsUpdated.bind(this));
      if (newVal === oldVal) {
        return;
      }
      if (newVal && self.treeColumn && !self._dueFiltering_) {
        self.filteredRows = self.doFilter();
      }
      self._dueFiltering_ = false;
      self.rowsUpdated(newVal, oldVal);
    });
  }

  static isColumnsReordered(newCols, oldCols) {
    if (!newCols || !oldCols) {
      return false;
    }
    if (newCols.length !== oldCols.length) {
      return false;
    }
    for (let i = 0; i < newCols.length; i++) {
      if (newCols[i].$id !== oldCols[i].$id) {
        return true;
      }
    }
    return false;
  }

  static isAddOrRemoveColumns(newCols, oldCols) {
    if (!newCols || !oldCols) {
      return false;
    }
    if (newCols.length !== oldCols.length) {
      return true;
    }
    return false;
  }

  setTreeAndGroupColumns() {
    if (this.options && this.options.columns) {
      this.treeColumn = this.options.columns.find(c => c.isTreeColumn);

      if (!this.treeColumn) {
        this.groupColumn = this.options.columns.find(c => c.group);
      } else {
        this.groupColumn = undefined;
        if (!this.treeColumn.parentRelationProp) { this.treeColumn.parentRelationProp = this.treeColumn.prop; }
      }
    }
  }

  /**
   * @description Constructs the rows for the page, assuming we're using internal paging.
   */
  buildInternalPage() {
    let i;
    let rowsIndex;

    this.tempRows.splice(0, this.tempRows.length);

    for (i = 0; i < this.options.paging.size; i += 1) {
      rowsIndex = (this.options.paging.offset * this.options.paging.size) + i;
      if (this.treeColumn) {
        if (angular.isDefined(this.treeRows) && angular.isDefined(this.treeRows[rowsIndex])) {
          this.tempRows[i] = this.treeRows[rowsIndex];
        } else {
          break;
        }
      } else if (angular.isDefined(this.rows[rowsIndex])) {
        this.tempRows[i] = this.rows[rowsIndex];
      } else {
        break;
      }
    }
  }

  setConditionalWatches() {
    for (let i = this.watchListeners.length - 1; i >= 0; i -= 1) {
      this.watchListeners[i]();

      this.watchListeners.splice(i, 1);
    }

    if (this.options &&
      (this.options.scrollbarV ||
        (!this.options.scrollbarV &&
          this.options.paging &&
          this.options.paging.size))) {
      let sized = false;

      this.watchListeners.push(this.$scope.$watch('body.options.paging.size', (newVal, oldVal) => {
        if (!sized || newVal > oldVal) {
          this.getRows();
          sized = true;
        }
      }));

      this.watchListeners.push(this.$scope.$watch('body.options.paging.count', (count) => {
        this.count = count;
        this.updatePage();
      }));

      this.watchListeners.push(this.$scope.$watch('body.options.paging.offset', (newVal) => {
        if (this.options.paging.size) {
          if (this.options.paging.mode === 'internal') {
            this.buildInternalPage();
          }

          if (this.onPage) {
            this.onPage({
              offset: newVal,
              size: this.options.paging.size,
            });
          }
        }
      }));
    }
  }

  rowsUpdated(newVal, oldVal) {
    if (newVal && this.options.paging.mode !== 'external') {
      this.options.paging.count = newVal.length;
    }
    if (this.noNeedRowsUpdated) {
      this.noNeedRowsUpdated = false;
      return;
    }
    if (!newVal) {
      this.getRows(true);
    } else {
      this.count = newVal.length;

      if (this.treeColumn || this.groupColumn) {
        this.buildRowsByGroup();
      }

      if (this.options.scrollbarV) {
        const refresh = newVal && oldVal && newVal.length != oldVal.length;
        /* const refresh = newVal && oldVal && (newVal.length === oldVal.length
          || newVal.length < oldVal.length);*/
        this.getRows(refresh);
      } else {
        let rows = this.rows;

        if (this.treeColumn) {
          rows = this.buildTree();
        } else if (this.groupColumn) {
          rows = this.buildGroups();
        }

        if (this.options.paging.mode === 'external') {
          // We're using external paging
          const idxs = this.getFirstLastIndexes();
          let idx = idxs.first;

          this.tempRows.splice(0, this.tempRows.length);
          while (idx < idxs.last) {
            this.tempRows.push(rows[idx += 1]);
          }
        } else if (this.options.paging.mode === 'internal') {
          // We're using internal paging
          this.buildInternalPage();
        } else {
          // No paging
          this.tempRows.splice(0, this.tempRows.length);
          this.tempRows.push(...rows);
        }
      }
    }
    if (this.options.checkboxSelection) {
      this.checkedRows.clear();
      if (newVal) {
        newVal.forEach((row) => {
          if (angular.isDefined(row._checked)) {
            this.checkedRows.set(row, row._checked);
          }
        });
      }
    }
  }

  /**
   * Gets the first and last indexes based on the offset, row height, page size, and overall count.
   */
  getFirstLastIndexes() {
    let firstRowIndex = 0;
    let endIndex = this.count;

    if (this.options.scrollbarV) {
      firstRowIndex = Math.max(Math.floor((
        this.options.internal.offsetY || 0) / this.options.rowHeight, 0), 0);
      endIndex = Math.min(firstRowIndex + this.options.paging.size, this.count);
    } else if (this.options.paging.mode === 'external') {
      firstRowIndex = Math.max(this.options.paging.offset * this.options.paging.size, 0);
      endIndex = Math.min(firstRowIndex + this.options.paging.size, this.count);
    }

    return {
      first: firstRowIndex,
      last: endIndex,
    };
  }

  /**
   * Updates the page's offset given the scroll position.
   */
  updatePage() {
    const curPage = this.options.paging.offset;
    const idxs = this.getFirstLastIndexes();

    if (angular.isUndefined(this.options.internal.oldScrollPosition)) {
      this.options.internal.oldScrollPosition = 0;
    }

    const oldScrollPosition = this.options.internal.oldScrollPosition;
    let newPage = idxs.first / this.options.paging.size;

    this.options.internal.oldScrollPosition = newPage;

    if (newPage < oldScrollPosition) {
      // scrolling up
      newPage = Math.floor(newPage);
    } else if (newPage > oldScrollPosition) {
      // scrolling down
      newPage = Math.ceil(newPage);
    } else {
      // equal, just stay on the current page
      newPage = curPage;
    }

    if (!isNaN(newPage)) {
      this.options.paging.offset = newPage;
    }
  }

  /**
   * Recursively calculate row depth for unsorted backend data
   * @param row
   * @param depth
   * @return {Integer}
  */
  calculateDepth(row, depth = 0) {
    const parentProp = this.treeColumn ? this.treeColumn.relationProp : this.groupColumn.prop;
    const prop = this.treeColumn.prop;

    if (!row[parentProp]) {
      return depth;
    }

    if (row.$$depth) {
      return row.$$depth + depth;
    }

    /* Get data from cache, if exists*/
    const cachedParent = this.index[row[parentProp]];

    if (cachedParent) {
      depth += 1;
      return this.calculateDepth(cachedParent, depth);
    }

    for (let i = 0, len = this.rows.length; i < len; i += 1) {
      const parent = this.rows[i];
      if (parent[prop] === row[parentProp]) {
        depth += 1;
        return this.calculateDepth(parent, depth);
      }
    }

    return depth;
  }

  /**
   * Matches groups to their respective parents by index.
   *
   * Example:
   *
   *  {
   *    "Acme" : [
   *      { name: "Acme Holdings", parent: "Acme" }
   *    ],
   *    "Acme Holdings": [
   *      { name: "Acme Ltd", parent: "Acme Holdings" }
   *    ]
   *  }
   *
   */
  buildRowsByGroup() {
    this.index = {};
    this.rowsByGroup = {};

    const parentProp = this.treeColumn ? this.treeColumn.relationProp : this.groupColumn.prop;
    let treeProp = '';
    if (this.treeColumn) {
      treeProp = this.treeColumn.parentRelationProp;
    }

    for (let i = 0, len = this.rows.length; i < len; i += 1) {
      const row = this.rows[i];
      this.processNode(row, null, treeProp, parentProp);
    }
  }

  buildTreeNode(node, nodes) {
    if (!node || !nodes) {
      return;
    }
    const parentProp = this.treeColumn ? this.treeColumn.relationProp : this.groupColumn.prop;
    let treeProp = '';
    if (this.treeColumn) {
      treeProp = this.treeColumn.parentRelationProp;
    }
    for (let i = 0, len = nodes.length; i < len; i += 1) {
      const row = nodes[i];
      this.rows.push(row);
      this.processNode(row, node, treeProp, parentProp);
    }
    // this.rows = this.rows.concat(nodes);
  }

  processNode(row, parent, treeProp, parentProp) {
    // bgmd for lazy load
    if (row._lazyChildren) {
      if (treeProp && !this.rowsByGroup[row[treeProp]]) {
        this.rowsByGroup[row[treeProp]] = [];
      }
    }
    // build groups
    const relVal = parent ? parent[treeProp] : row[parentProp];
    if (relVal) {
      if (this.rowsByGroup[relVal]) {
        this.rowsByGroup[relVal].push(row);
      } else {
        this.rowsByGroup[relVal] = [row];
      }
    }
    // build indexes
    if (this.treeColumn) {
      const prop = this.treeColumn.parentRelationProp;
      this.index[row[prop]] = row;

      if (!row[parentProp]) {
        row.$$depth = 0;
      } else {
        if (!parent) {
          parent = this.index[row[parentProp]];
        }
        if (angular.isUndefined(parent)) {
          for (let j = 0, len = this.rows.length; j < len; j += 1) {
            if (this.rows[j][prop] === relVal) {
              parent = this.rows[j];
              break;
            }
          }
        }
        if (angular.isUndefined(parent.$$depth)) {
          parent.$$depth = this.calculateDepth(parent);
        }
        row.$$depth = parent.$$depth + 1;
        if (parent.$$children) {
          if (!parent.$$children.includes(row[prop])) {
            parent.$$children.push(row[prop]);
          }
        } else {
          parent.$$children = [row[prop]];
        }
      }
    }
  }

  /**
   * Rebuilds the groups based on what is expanded.
   * This function needs some optimization, todo for future release.
   * @return {Array} the temp array containing expanded rows
   */
  buildGroups() {
    const temp = [];

    angular.forEach(this.rowsByGroup, (v, k) => {
      temp.push({
        name: k,
        group: true,
      });

      if (this.expanded[k]) {
        temp.push(...v);
      }
    });

    return temp;
  }

  /**
   * Returns if the row is selected
   * @param  {row}
   * @return {Boolean}
   */
  isSelected(row) {
    let selected = false;

    if (this.options.selectable) {
      if (this.options.multiSelect) {
        selected = this.selected.indexOf(row) > -1;
      } else {
        selected = this.selected === row;
      }
    }

    return selected;
  }

  /**
   * Occurs when a row was selected
   * @param  {object} rows
   */
  onSelected(rows) {
    if (rows && rows.length) {
      if (this.options.selectable) {
        if (!this.options.multiSelect) {
          this.selected = rows[0];
        }
      }
    }
    this.onSelect({
      rows,
    });
  }


  /**
   * Returns if the row is draggable
   * @param  {row}
   * @return {Boolean}
   */
  isDraggable(row) {
    return this.options.rowDraggable;
  }

  /**
   * handles `dragend` event
   * @param {object} event
   * @param {object} row
   * @param {object} rowTo
   */
  onDropRow(event, indexFrom, indexTo) {
    const from = this.rows.find(value => value.$$index == indexFrom);
    const parent = this.rows.find(value => value.$$index == indexTo);
    const self = this;
    this.onMoveRow({ rowFrom: from, rowTo: parent }).then(() => {
      if (self.treeColumn) {
        if (parent) {
          if (parent._lazyChildren && !parent._loaded_) {
            // for node with lazy loading - children is not yet have been loaded
            // remove this row and her children
            self.removeTreeRows(from[self.treeColumn.parentRelationProp]);
          } else {
            // remove this child from old parent
            self.removeChild(from[self.treeColumn.relationProp], from[self.treeColumn.parentRelationProp]);
            // set new parent
            from[self.treeColumn.relationProp] = parent[self.treeColumn.parentRelationProp];
          }
        } else {
          from[self.treeColumn.relationProp] = null;
        }
        self.buildRowsByGroup();
        self.refreshTree();
      } else {
        // merely replace
        self.rows.move(indexFrom, indexTo);
        if (self.groupColumn) {
          self.refreshGroups();
        } else {
          self.getRows(true);
        }
      }
    }).catch(err => console.error(err));
  }
  /**
   * Remove child from parent
   * @param {string} parentId
   * @param {string} childId
   */
  removeChild(parentId, childId) {
    const key = this.treeColumn.parentRelationProp;
    const parent = this.rows.find(value => value[key] === parentId);
    if (!parent) {
      return;
    }
    if (parent.$$children) {
      const i = parent.$$children.findIndex(child => child === childId);
      if (i !== -1) {
        parent.$$children.splice(i, 1);
      }
    }
  }

  /**
   * Remove row and her children from this.rows
   * @param {string} id - row key
   */
  removeTreeRows(id) {
    // const key = this.treeColumn.parentRelationProp;
    const { index, row } = this.getRowInTree(id);
    /* const index = this.rows.findIndex(value => value[key] == id);
    if (index != -1) {
      row = this.rows[index];
    }*/
    if (row) {
      this.rows.splice(index, 1);
      if (this.checkedRows) {
        this.checkedRows.delete(row);
      }
      if (this.expanded[id]) {
        delete this.expanded[id];
      }
      if (row.$$children) {
        row.$$children.forEach((child) => {
          this.removeTreeRows(child);
        });
      }
    }
  }

  /**
   * Find row in rows array by id
   * @param {string} id - row key
   * @returns {onject} index in array and row
   */
  getRowInTree(id) {
    const key = this.treeColumn.parentRelationProp;
    let row = null;
    const index = this.rows.findIndex(value => value[key] === id);
    if (index !== -1) {
      row = this.rows[index];
    }
    return {
      index,
      row,
    };
  }

  /**
   * Creates a tree of the existing expanded values
   * @return {array} the built tree
   */
  buildTree() {
    const temp = [];
    const self = this;

    if (!this.filteredRows) { this.filteredRows = this.rows; }
    // rows filtering
    let flt = false;
    if (this._applyFilter) {
      this.filteredRows = this.doFilter(this._applyFilter);
      this._applyFilter = null;
      flt = true;
    }

    function addChildren(fromArray, toArray, level) {
      fromArray.forEach((row) => {
        const relVal = row[self.treeColumn.relationProp];
        const key = row[self.treeColumn.parentRelationProp];
        const groupRows = self.rowsByGroup[key];
        if (flt && groupRows && groupRows.length > 0) {
          self.expanded[key] = true;
        }
        const expanded = self.expanded[key];

        if (level > 0 || !relVal) {
          if (self.filteredRows.includes(row)) {
            toArray.push(row);
          }
          if (groupRows && groupRows.length > 0 && expanded) {
            addChildren(groupRows, toArray, level + 1);
          }
        }
      });
    }

    addChildren(this.rows, temp, 0);

    if (this.options.paging.mode === 'internal') {
      // this array using in paging
      this.treeRows = temp;
    }

    return temp;
  }

  /**
   * Creates the intermediate collection that is shown in the view.
   * @param  {boolean} refresh - bust the tree/group cache
   */
  getRows(refresh) {
    // only proceed when we have pre-aggregated the values
    if ((this.treeColumn || this.groupColumn) && !this.rowsByGroup) {
      return false;
    }

    // clear $$index
    this.tempRows.forEach(value => delete value.$$index);

    let temp;

    if (this.treeColumn) {
      temp = this.treeTemp || [];
      // cache the tree build
      if ((refresh || !this.treeTemp)) {
        this.treeTemp = temp = this.buildTree();
        this.count = temp.length;

        // have to force reset, optimize this later
        this.tempRows.splice(0, this.tempRows.length);
      }
    } else if (this.groupColumn) {
      temp = this.groupsTemp || [];
      // cache the group build
      if ((refresh || !this.groupsTemp)) {
        this.groupsTemp = temp = this.buildGroups();
        this.count = temp.length;
      }
    } else {
      temp = this.rows;
      if (refresh === true) {
        this.tempRows.splice(0, this.tempRows.length);
      }
    }

    let idx = 0;
    const indexes = this.getFirstLastIndexes();
    let rowIndex = indexes.first;

    // slice out the old rows so we don't have duplicates
    this.tempRows.splice(0, indexes.last - indexes.first);

    while (rowIndex <= indexes.last && rowIndex < this.count) {
      const row = temp[rowIndex];

      if (row) {
        row.$$index = rowIndex;
        this.tempRows[idx] = row;
      }

      idx += 1;
      rowIndex += 1;
    }

    if (this.options.internal && this.options.internal.styleTranslator) {
      this.options.internal.styleTranslator.update(this.tempRows);
    }
    return this.tempRows;
  }

  /**
   * Returns the styles for the table body directive.
   * @return {object}
   */
  styles() {
    const styles = {
      width: `${this.options.internal.innerWidth}px`,
    };

    if (!this.options.scrollbarV) {
      styles.overflowY = 'hidden';
    } else if (this.options.scrollbarH === false) {
      styles.overflowX = 'hidden';
    }

    if (this.options.scrollbarV) {
      styles.height = `${this.options.internal.bodyHeight}px`;
    }

    if (this.options.fixedHeader) {
      if (!this.options.scrollbarV) {
        const h = this.options.headerHeight + this.options.footerHeight;
        styles.height = `calc(calc(100% - ${h}px)`;
      }
      styles.overflowY = 'auto';
    }

    return styles;
  }

  /**
   * Returns the styles for the row diretive.
   * @param  {row}
   * @return {styles object}
   */
  rowStyles(row) {
    const styles = {};

    if (this.options.rowHeight === 'auto') {
      styles.height = `${this.options.rowHeight}px`;
    }
    if (this.isSelected(row)) {
      styles.backgroundColor = this.options.rowSelectionColor;
      styles.color = '#fff';
    }

    return styles;
  }

  /**
   * Builds the styles for the row group directive
   * @param  {object} row
   * @return {object} styles
   */
  groupRowStyles(row) {
    const styles = this.rowStyles(row);
    styles.width = `${this.columnWidths.total}px`;
    return styles;
  }

  /**
   * Returns the css classes for the row directive.
   * @param  {row}
   * @return {css class object}
   */
  rowClasses(row) {
    const styles = {
      selected: this.isSelected(row),
      'dt-row-even': row && row.$$index % 2 === 0,
      'dt-row-odd': row && row.$$index % 2 !== 0,
    };

    if (this.treeColumn) {
      // if i am a child
      styles['dt-leaf'] = this.rowsByGroup[row[this.treeColumn.relationProp]];
      // if i have children
      styles['dt-has-leafs'] = this.rowsByGroup[row[this.treeColumn.parentRelationProp]];
      // the depth
      styles[`dt-depth-${row.$$depth}`] = true;
    }

    return styles;
  }

  /**
   * Returns the row model for the index in the view.
   * @param  {index}
   * @return {row model}
   */
  getRowValue(idx) {
    return this.tempRows[idx];
  }

  /**
   * Calculates if a row is expanded or collasped for tree grids.
   * @param  {row}
   * @return {boolean}
   */
  getRowExpanded(row) {
    if (this.treeColumn) {
      return row && this.treeColumn.parentRelationProp ? this.expanded[row[this.treeColumn.parentRelationProp]] : false;
    } else if (this.groupColumn) {
      return this.expanded[row.name];
    }

    return undefined;
  }

  /**  bgmd
  * Calculates if a row is loading data now  for tree grids.
  * @param  {row}
  * @return {boolean}
  */
  getRowLoading(row) {
    if (this.treeColumn) {
      return this.loading[row[this.treeColumn.parentRelationProp]];
    } else if (this.groupColumn) {
      return this.loading[row.name];
    }
    return undefined;
  }


  refresh() {
    this.getRows(true);
  }

  /**
   * Calculates if the row has children
   * @param  {row}
   * @return {boolean}
   */
  getRowHasChildren(row) {
    if (!this.treeColumn) return undefined;

    const children = this.rowsByGroup[row[this.treeColumn.parentRelationProp]];

    return angular.isDefined(children) || (children && !children.length);
  }

  refreshTree() {
    this.refresh(TREE_TYPES.TREE);
  }

  /**
   * Tree toggle event from a cell
   * @param  {row model}
   * @param  {cell model}
   */
  onTreeToggled(row, cell) {
    const val = row[this.treeColumn.parentRelationProp];
    const self = this;
    this._hackToAvoidUnwantedScroll_ = true;
    if (row._lazyChildren && !row._loaded_) {
      this.expanded[val] = false;
      this.loading[val] = true;
      this.onTreeLoad(row, cell).then((data) => {
        row._loaded_ = true;
        self.noNeedRowsUpdated = true;
        self.buildTreeNode(row, data);
        self.filteredRows = self.doFilter();
        self.onTreeToggledProcess(row, cell);
        self.loading[val] = false;
      }).catch((error) => {
        self.loading[val] = false;
        this.$log.error(error);
      });
    } else {
      this.onTreeToggledProcess(row, cell);
    }
  }

  onTreeToggledProcess(row, cell) {
    const val = row[this.treeColumn.parentRelationProp];
    this.expanded[val] = !this.expanded[val];

    this.refreshTree();

    this.onTreeToggle({
      row,
      cell,
    });
  }

  /** bgmd
   * Tree leap load event from a cell
   * @param  {row model}
   * @param  {cell model}
   */
  onTreeLoad(row, cell) {
    return this.onTreeLoader({
      row,
      cell,
    });
  }


  refreshGroups() {
    this.refresh(TREE_TYPES.GROUP);
  }

  /**
   * Invoked when the row group directive was expanded
   * @param  {object} row
   */
  onGroupToggle(row) {
    this.expanded[row.name] = !this.expanded[row.name];

    this.refreshGroups();
  }

  /**
   * Defines and return changhed column's filter
   * @returns {object} filter object
   */
  filterChanged() {
    if (!this.filters) {
      return false;
    }
    for (let i = 0; i < this.options.columns.length; i++) {
      const column = this.options.columns[i];
      if (!column.filter) {
        continue;
      }
      const filter = this.filters[column.name];
      if (filter && filter.phrase != column.filterKeywords) {
        filter.phrase = column.filterKeywords;
        return filter;// { col: column, filterKeywords: column.filterKeywords };
      }
    }
    return false;
  }

  /** bgmd
  * create filter's helper object
  */
  createFilters(force) {
    if (!force && this.filters) {
      return;
    }
    this.filters = {
      list: [],
    };
    const self = this;
    this.options.columns.forEach((col, index) => {
      if (!col.filter) {
        return;
      }
      const filter = {
        name: col.name,
        prop: col.prop,
        getter: col.cellDataGetter,
        rowsBefore: null,
        rowsAfter: null,
        phrase: null,
        order: index,
      };
      self.filters.list.push(filter);
      self.filters[col.name] = filter;
    });
  }

  /**
   * Change filter objects after columns reordered
   * @returns {object} filtered rows
   */
  headerReordered() {
    // console.info('onHeaderReorder');
    if (!this.filters || !this.filters.list.length) {
      return;
    }
    const initRows = this.filters.list[0].rowsBefore;
    // const list = this.filters.list;
    this.filters.list = [];
    const self = this;
    this.options.columns.forEach((col, index) => {
      if (!col.filter) {
        return;
      }
      const filter = self.filters[col.name];
      filter.rowsBefore = null;
      filter.rowsAfter = null;
      filter.order = index;
      self.filters.list.push(filter);
    });
    if (this.filters.list.length) {
      this.filters.list[0].rowsBefore = initRows;
      this.filters.list[0].rowsAfter = initRows;
    }
    // filter rows again starting with first column
    this.rows = this.doFilter(this.filters.list[0]);
  }

  /** bgmd
   * Filter pipeline
   * @param {object} filter
   * @return {object} filtered rows
   */
  filterPipe(filter) {
    let result = this.rows;
    for (let i = filter.order; i < this.filters.list.length; i++) {
      const f = this.filters.list[i];
      if (i > filter.order) {
        if (!f.phrase) {
          f.rowsBefore = null;
          f.rowsAfter = null;
          continue;
        }
        f.rowsBefore = result;
      }
      result = f.rowsAfter = f.rowsBefore.filter((row) => {
        const value = f.getter ? f.getter(row[f.prop]) : row[f.prop];
        return (value && value.toString().toLowerCase().indexOf(f.phrase) !== -1) || !f.phrase;
      });
    }
    return result;
  }

  /**
   * Row filtering
   * @param {object} current changed filter object
   * @returns {object} filtered rows
   */
  doFilter(filter) {
    if (!this.rows || !this.filters || !this.filters.list.length) {
      return this.rows;
    }
    this._dueFiltering_ = true;
    if (this.filters.list.length && !this.filters.list[0].rowsBefore) {
      this.filters.list[0].rowsBefore = this.rows;
      this.filters.list[0].rowsAfter = this.rows;
    }
    if (filter) {
      if (!filter.rowsBefore) {
        let i = filter.order - 1;
        while (i >= 0) {
          const prev = this.filters.list[i];
          if (prev.rowsAfter) {
            filter.rowsBefore = prev.rowsAfter;
            break;
          }
          i--;
        }
      }
    } else {
      filter = this.filters.list[0];
      filter.rowsBefore = this.rows;
    }
    const rows = this.filterPipe(filter);
    this.onRowsFiltered({
      rows,
    });
    return rows;
  }

}
