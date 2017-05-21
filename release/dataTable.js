/**
 * angular-data-table - A feature-rich but lightweight ES6 AngularJS Data Table crafted for large data sets!
 * @version v0.8.0
 * @link http://jonshaffer.github.io/angular-data-table/
 * @license MIT
 */
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('DataTable', ['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.DataTable = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  PositionHelper.$inject = ["$log"];
  PopoverDirective.$inject = ["$animate", "$compile", "$document", "$http", "$q", "$templateCache", "$timeout", "PopoverRegistry", "PositionHelper"];
  DropdownDirective.$inject = ["$document", "$timeout"];
  DropdownToggleDirective.$inject = ["$timeout"];
  DropdownMenuDirective.$inject = ["$animate"];
  DataTableDirective.$inject = ["$window", "$timeout", "$parse"];
  ResizableDirective.$inject = ["$document", "$timeout"];
  HeaderDirective.$inject = ["$timeout"];
  HeaderCellDirective.$inject = ["$compile"];
  CellDirective.$inject = ["$rootScope", "$compile"];
  FocusOnDirective.$inject = ["$timeout"];
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  /* eslint-disable no-extend-native, no-bitwise */

  (function extendArray() {
    // Taken from Reid's answer at http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
    /**
     * Array.prototype.move() - move element with shift from old_index to new_index
     */
    if (!Array.prototype.move) {
      Array.prototype.move = function (old_index, new_index) {
        while (old_index < 0) {
          old_index += this.length;
        }
        while (new_index < 0) {
          new_index += this.length;
        }
        if (new_index >= this.length) {
          var k = new_index - this.length;
          while (k-- + 1) {
            this.push(undefined);
          }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this; // for testing purposes
      };
    }
    /**
     * Array.prototype.find()
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
     */
    if (!Array.prototype.find) {
      Object.defineProperty(Array.prototype, 'find', {
        value: function value(predicate, thisArg) {
          if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
          }

          if (!angular.isFunction(predicate)) {
            throw new TypeError('predicate must be a function');
          }

          var list = Object(this);
          var length = list.length >>> 0;

          var value = void 0;

          for (var i = 0; i < length; i += 1) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
              return value;
            }
          }

          return undefined;
        }
      });
    }

    /**
     * Array.prototype.findIndex()
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
     */
    if (!Array.prototype.findIndex) {
      Object.defineProperty(Array.prototype, 'findIndex', {
        value: function value(predicate, thisArg) {
          if (this == null) {
            throw new TypeError('Array.prototype.findIndex called on null or undefined');
          }

          if (!angular.isFunction(predicate)) {
            throw new TypeError('predicate must be a function');
          }

          var list = Object(this);
          var length = list.length >>> 0;

          var value = void 0;

          for (var i = 0; i < length; i += 1) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
              return i;
            }
          }
          return -1;
        },

        enumerable: false,
        configurable: false,
        writable: false
      });
    }
  })();

  /**
   * Resizable directive
   * http://stackoverflow.com/questions/18368485/angular-js-resizable-div-directive
   * @param {object}
   * @param {function}
   * @param {function}
   */
  function ResizableDirective($document, $timeout) {
    return {
      restrict: 'A',
      scope: {
        isResizable: '=resizable',
        minWidth: '=',
        maxWidth: '=',
        onResize: '&'
      },
      link: function link($scope, $element) {
        if ($scope.isResizable) {
          $element.addClass('resizable');
        }

        var handle = angular.element('<span class="dt-resize-handle" title="Resize"></span>');
        var parent = $element.parent();

        var prevScreenX = void 0;

        handle.on('mousedown', function (event) {
          if (!$element[0].classList.contains('resizable')) {
            return;
          }

          event.stopPropagation();
          event.preventDefault();

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
          event = event.originalEvent || event;

          var width = parent[0].clientWidth;
          var movementX = event.movementX || event.mozMovementX || event.screenX - prevScreenX;
          var newWidth = width + (movementX || 0);

          prevScreenX = event.screenX;

          if ((!$scope.minWidth || newWidth >= $scope.minWidth) && (!$scope.maxWidth || newWidth <= $scope.maxWidth)) {
            parent.css({
              width: newWidth + 'px'
            });
          }
        }

        function mouseup() {
          if ($scope.onResize) {
            $timeout(function () {
              var width = parent[0].clientWidth;
              if (width < $scope.minWidth) {
                width = $scope.minWidth;
              }
              $scope.onResize({ width: width });
            });
          }

          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }

        $element.append(handle);
      }
    };
  }

  /**
   * Sortable Directive
   * http://jsfiddle.net/RubaXa/zLq5J/3/
   * https://jsfiddle.net/hrohxze0/6/
   * @param {function}
   */
  function SortableDirective() {
    return {
      restrict: 'A',
      scope: {
        isSortable: '=sortable',
        onSortableSort: '&'
      },
      link: function link($scope, $element) {
        var dragEl = void 0;
        var nextEl = void 0;

        function isbefore(a, b) {
          if (a.parentNode === b.parentNode) {
            for (var cur = a; cur; cur = cur.previousSibling) {
              if (cur === b) {
                return true;
              }
            }
          }
          return false;
        }

        function onDragEnter(e) {
          var target = e.target;
          if (isbefore(dragEl, target)) {
            target.parentNode.insertBefore(dragEl, target);
          } else if (target.nextSibling && target.hasAttribute('draggable')) {
            target.parentNode.insertBefore(dragEl, target.nextSibling.nextSibling);
          }
        }

        function onDragEnd(evt) {
          evt.preventDefault();

          dragEl.classList.remove('dt-clone');

          $element.off('dragend', onDragEnd);
          $element.off('dragenter', onDragEnter);

          if (nextEl !== dragEl.nextSibling) {
            $scope.onSortableSort({
              event: evt,
              columnId: angular.element(dragEl).attr('data-id')
            });
          }
        }

        function onDragStart(evt) {
          if (!$scope.isSortable) return;

          evt = evt.originalEvent || evt;

          dragEl = evt.target;
          nextEl = dragEl.nextSibling;
          dragEl.classList.add('dt-clone');

          evt.dataTransfer.effectAllowed = 'move';
          evt.dataTransfer.setData('Text', dragEl.textContent);

          $element.on('dragenter', onDragEnter);
          $element.on('dragend', onDragEnd);
        }

        $element.on('dragstart', onDragStart);

        $scope.$on('$destroy', function () {
          $element.off('dragstart', onDragStart);
        });
      }
    };
  }

  /**
   * Draggable row Directive
   * http://jsfiddle.net/RubaXa/zLq5J/3/
   * https://jsfiddle.net/hrohxze0/6/
   * @param {function}
   */
  function DraggableRowDirective() {
    return {
      restrict: 'A',
      scope: {
        isDraggable: '=draggableRow',
        onDrop: '&'
      },
      link: function link($scope, $element) {
        var dragEl = void 0;
        var nextEl = void 0;
        var toEl = void 0;

        function findParentDraggable(elem) {
          if (!elem) return null;
          var el = elem;
          do {
            if (el.hasAttribute && el.hasAttribute('draggable')) {
              return el;
            }
          } while (el = el.parentNode);
          return null;
        }

        function isDescendant(parent, child) {
          var node = child.parentNode;
          while (node != null) {
            if (node == parent) {
              return true;
            }
            node = node.parentNode;
          }
          return false;
        }

        function onDragEnter(e) {
          toEl = e.target;
        }

        function onDragOver(e) {
          if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
          }
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
          return false;
        }

        function onDragEnd(evt) {
          evt.preventDefault();
          dragEl.classList.remove('dt-clone');

          $element.off('dragend', onDragEnd);
          $element.off('dragover', onDragOver);
          $element.off('dragenter', onDragEnter);

          var elem = document.elementFromPoint(evt.clientX, evt.clientY);
          if (!isDescendant($element[0], elem)) toEl = null;
          var target = findParentDraggable(toEl);
          var indexFrom = +dragEl.getAttribute('rowindex');
          var indexTo = target ? +target.getAttribute('rowindex') : -1;
          //console.log('onDragEnd', dragEl, target);
          if (target !== dragEl) {
            $scope.onDrop({
              event: evt,
              indexFrom: indexFrom,
              indexTo: indexTo
            });
          }
        }

        function onDragStart(evt) {
          if (!$scope.isDraggable) return;

          evt = evt.originalEvent || evt;

          dragEl = evt.target;
          nextEl = dragEl.nextSibling;
          dragEl.classList.add('dt-clone');

          evt.dataTransfer.effectAllowed = 'move';
          evt.dataTransfer.setData('Text', dragEl.textContent);

          $element.on('dragenter', onDragEnter);
          $element.on('dragover', onDragOver);
          $element.on('dragend', onDragEnd);
        }

        $element.on('dragstart', onDragStart);

        $scope.$on('$destroy', function () {
          $element.off('dragstart', onDragStart);
        });
      }
    };
  }

  /**
   * Default Table Options
   * @type {object}
   */
  var TableDefaults = {

    /**
     * Checkbox selection (true) vs. row click (false)
     * @type {boolean}
     */
    checkboxSelection: false,

    /**
     * Options: 'flex', 'force', 'standard'
     * @type {string}
     */
    columnMode: 'standard',

    /**
     * Message to show when array is presented
     * but contains no values
     * @type {string}
     */
    emptyMessage: 'No data to display',

    /**
     * The minimum footer height in pixels.
     * pass falsey for no footer
     * @type {number}
     */
    footerHeight: 0,

    /**
     * The minimum header height in pixels.
     * pass falsey for no header
     * @type {number}
     */
    headerHeight: 30,

    /**
     * Internal options
     * @type {Object}
     */
    internal: {
      offsetX: 0,
      offsetY: 0,
      innerWidth: 0,
      bodyHeight: 300
    },

    /**
     * Loading indicator
     * @type {boolean}
     */
    loadingIndicator: false,

    /**
     *Loading message presented when the array is undefined
     * @type {boolean}
     */
    loadingMessage: 'Loading...',

    /**
     * Whether multiple rows can be selected at once.
     * @type {boolean}
     */
    multiSelect: false,

    /**
     * The default paging Options
     * @type {Object}
     */
    paging: {
      /**
       * Total count
       * @type {number}
       */
      count: 0,

      /**
       * Page offset
       * @type {number}
       */
      offset: 0,

      /**
       * The paging mode to use: 'internal', 'external', null (none)
       * @type: {string}
       */
      mode: null,

      /**
       * Page size
       * @type {number}
       */
      size: 10
    },

    /**
     * Whether columns can be reordered.
     * @type {boolean}
     */
    reorderable: false,

    /**
     * The row height, which is necessary to calculate
     * the height for the lazy rendering.
     * @type {number}
     */
    rowHeight: 30,

    /**
     * Enable vertical scrollbars
     * @type {boolean}
     */
    scrollbarV: true,

    /**
     * Whether rows are selectable.
     * @type {boolean}
     */
    selectable: false,

    /**
     * If yes then the column can be sorted.
     * @type {boolean}
     */
    sortable: true,

    // sorting by single or multiple columns
    /**
     * Whether sorting can be done on single or multiple columns.
     * @type {string}
     */
    sortType: 'multiple',

    /**
     * Whether sorting modifier key is active.
     * @type {boolean}
     */
    modifierActive: true,
    /**
     * If yes then the rows can be drag and drop.
     * @type {boolean}
     */
    rowDraggable: false,
    /**
     * This function uses in inline edit for stopping edit concrete row
     * @type {function}
     * @return {boolean}
     */
    editFilter: null,
    /**
     * True if data in table is read only. To need for optimization in CellDirective ($scope.$watch('cell.row'))
     * @type {boolean}
     */
    readOnly: false,
    /**
     * Placeholder for filter field
     * @type {boolean}
     */
    filterPlaceholder: 'Filter',
    /**
     * If yes then tree will be toggled by double click
     * @type {boolean}
     */
    treeToggleDblClick: false
  };

  /**
   * Default Column Options
   * @type {object}
   */
  var ColumnDefaults = {

    /**
     * Whether the column can automatically resize to fill space in the table.
     * @type {boolean}
     */
    canAutoResize: true,

    /**
     * The getter function(value) that returns the cell data for the cellRenderer.
     * If not provided, the cell data will be collected from row data instead.
     * @type {function}
     */
    cellDataGetter: undefined,

    /**
     * The cell renderer function(scope, elm) that returns React-renderable content for table cell.
     * @type {function}
     */
    cellRenderer: undefined,

    /**
     * body cell css class name
     * @type {string}
     */
    className: undefined,

    /**
     * Custom sort comparator
     * pass false if you want to server sort
     * @type {function|boolean}
     */
    comparator: undefined,

    /**
     * The grow factor relative to other columns. Same as the flex-grow
     * API from http://www.w3.org/TR/css3-flexbox/. Basically,
     * take any available extra width and distribute it proportionally
     * according to all columns' flexGrow values.
     * @type {number}
     */
    flexGrow: 0,

    /**
     * Pinned to the left
     * @type {boolean}
     */
    frozenLeft: false,

    /**
     * Pinned to the right
     * @type {boolean}
     */
    frozenRight: false,

    /**
     * Grows all rows by this column value
     * Only one column can have this set, cannot be combined with isTreeColumn
     * @type {boolean}
     */
    group: false,

    /**
     * Toggles the checkbox column in the header
     * for selecting all values given to the grid
     * @type {boolean}
     */
    headerCheckbox: false,

    /**
     * header cell css class name
     * @type {string}
     */
    headerClassName: undefined,

    /**
     * The cell renderer that returns content for table column header
     * @type {function}
     */
    headerRenderer: undefined,

    /**
     * Adds the checkbox selection to the column
     * @type {boolean}
     */
    isCheckboxColumn: false,

    /**
     * Adds +/- button and makes a secondary call to load nested data
     * Only one column can have this set, cannot be combined with isGroupColumn
     * @type {boolean}
     */
    isTreeColumn: false,

    /**
     * Maximum width of the column.
     * @type {number}
     */
    maxWidth: undefined,

    /**
     * Minimum width of the column.
     * @type {number}
     */
    minWidth: 100,

    /**
     * If yes then the column can be resized, otherwise it cannot.
     * @type {boolean}
     */
    resizable: true,

    /**
     * If yes then the column can be sorted.
     * @type {boolean}
     */
    sortable: true,
    /**
     * Default sort ('asc' or 'desc') for the column
     * @type {string}
     */
    sort: undefined,

    /**
     * If you want to sort a column by a special property
     * See an example in demos/sort.html
     * @type {string}
     */
    sortBy: undefined,

    /**
     * The width of the column, by default (in pixels).
     * @type {number}
     */
    width: 150
  };

  /**
   * Shim layer with setTimeout fallback
   * http://www.html5rocks.com/en/tutorials/speed/animations/
   */
  var requestAnimFrame = function getRequestAnimFrame() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function callCallback(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  }();

  /**
   * Creates a unique object id.
   */
  function ObjectId() {
    var timestamp = Math.floor(new Date().getTime() / 1000).toString(16);

    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
      return Math.floor(Math.random() * 16).toString(16);
    }).toLowerCase();
  }

  /**
   * Returns the columns by pin.
   * @param {array} colsumns
   */
  function ColumnsByPin(cols) {
    var ret = {
      left: [],
      center: [],
      right: []
    };

    for (var i = 0, len = cols.length; i < len; i += 1) {
      var c = cols[i];
      if (c.frozenLeft) {
        ret.left.push(c);
      } else if (c.frozenRight) {
        ret.right.push(c);
      } else {
        ret.center.push(c);
      }
    }

    return ret;
  }

  /**
   * Returns the widths of all group sets of a column
   * @param {object} groups
   * @param {array} all
   */
  function ColumnGroupWidths(groups, all) {
    return {
      left: ColumnTotalWidth(groups.left),
      center: ColumnTotalWidth(groups.center),
      right: ColumnTotalWidth(groups.right),
      total: ColumnTotalWidth(all)
    };
  }

  /**
   * Returns a deep object given a string. zoo['animal.type']
   * @param {object} obj
   * @param {string} path
   */
  function DeepValueGetter(obj, path) {
    if (!obj || !path) return obj;

    var split = path.split('.');

    var current = obj;

    if (split.length) {
      for (var i = 0, len = split.length; i < len; i += 1) {
        current = current[split[i]];
      }
    }

    return current;
  }

  /**
   * Converts strings from something to camel case
   * http://stackoverflow.com/questions/10425287/convert-dash-separated-string-to-camelcase
   * @param  {string} str
   * @return {string} camel case string
   */
  function CamelCase(str) {
    // Replace special characters with a space
    str = str.replace(/[^a-zA-Z0-9 ]/g, ' ');
    // put a space before an uppercase letter
    str = str.replace(/([a-z](?=[A-Z]))/g, '$1 ');
    // Lower case first character and some other stuff
    str = str.replace(/([^a-zA-Z0-9 ])|^[0-9]+/g, '').trim().toLowerCase();
    // uppercase characters preceded by a space or number
    str = str.replace(/([ 0-9]+)([a-zA-Z])/g, function (a, b, c) {
      return b.trim() + c.toUpperCase();
    });
    return str;
  }

  /**
   * Gets the width of the scrollbar.  Nesc for windows
   * http://stackoverflow.com/a/13382873/888165
   * @return {int} width
   */
  function ScrollbarWidth() {
    var outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.msOverflowStyle = 'scrollbar';
    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    outer.style.overflow = 'scroll';

    var inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
  }

  function NextSortDirection(sortType, currentSort) {
    if (sortType === 'single') {
      if (currentSort === 'asc') {
        return 'desc';
      }

      return 'asc';
    } else if (!currentSort) {
      return 'asc';
    } else if (currentSort === 'asc') {
      return 'desc';
    } else if (currentSort === 'desc') {
      return undefined;
    }
  }

  // Old angular versions being where preAssignBindingsEnabled === true and no $onInit
  function isOldAngular() {
    return angular.version.major === 1 && angular.version.minor < 5;
  }

  /**
   * Calculates the total width of all columns and their groups
   * @param {array} columns
   * @param {string} property width to get
   */
  function ColumnTotalWidth(columns, prop) {
    var totalWidth = 0;

    columns.forEach(function (c) {
      var has = prop && c[prop];
      totalWidth += has ? c[prop] : c.width;
    });

    return totalWidth;
  }

  /**
   * Calculates the Total Flex Grow
   * @param {array}
   */
  function GetTotalFlexGrow(columns) {
    var totalFlexGrow = 0;

    columns.forEach(function (c) {
      totalFlexGrow += c.flexGrow || 0;
    });

    return totalFlexGrow;
  }

  /**
   * Adjusts the column widths.
   * Inspired by: https://github.com/facebook/fixed-data-table/blob/master/src/FixedDataTableWidthHelper.js
   * @param {array} all columns
   * @param {int} width
   */
  function AdjustColumnWidths(allColumns, expectedWidth) {
    var columnsWidth = ColumnTotalWidth(allColumns);
    var totalFlexGrow = GetTotalFlexGrow(allColumns);
    var colsByGroup = ColumnsByPin(allColumns);

    if (columnsWidth !== expectedWidth) {
      ScaleColumns(colsByGroup, expectedWidth, totalFlexGrow);
    }
  }

  /**
   * Resizes columns based on the flexGrow property, while respecting manually set widths
   * @param {array} colsByGroup
   * @param {int} maxWidth
   * @param {int} totalFlexGrow
   */
  function ScaleColumns(colsByGroup, maxWidth, totalFlexGrow) {
    // calculate total width and flexgrow points for coulumns that can be resized
    angular.forEach(colsByGroup, function (cols) {
      cols.forEach(function (column) {
        if (!column.canAutoResize) {
          maxWidth -= column.width;
          totalFlexGrow -= column.flexGrow;
        } else {
          column.width = 0;
        }
      });
    });

    var hasMinWidth = {};
    var remainingWidth = maxWidth;

    function colsForEach(cols, widthPerFlexPoint) {
      cols.forEach(function (column, i) {
        // if the column can be resize and it hasn't reached its minimum width yet
        if (column.canAutoResize && !hasMinWidth[i]) {
          var newWidth = column.width + column.flexGrow * widthPerFlexPoint;
          if (angular.isDefined(column.minWidth) && newWidth < column.minWidth) {
            remainingWidth += newWidth - column.minWidth;
            column.width = column.minWidth;
            hasMinWidth[i] = true;
          } else {
            column.width = newWidth;
          }
        }
      });
    }

    // resize columns until no width is left to be distributed

    var _loop = function _loop() {
      var widthPerFlexPoint = remainingWidth / totalFlexGrow;
      remainingWidth = 0;

      angular.forEach(colsByGroup, function (cols) {
        colsForEach(cols, widthPerFlexPoint);
      });
    };

    do {
      _loop();
    } while (remainingWidth !== 0);
  }

  /**
   * Forces the width of the columns to
   * distribute equally but overflowing when nesc.
   *
   * Rules:
   *
   *  - If combined withs are less than the total width of the grid,
   *    proporation the widths given the min / max / noraml widths to fill the width.
   *
   *  - If the combined widths, exceed the total width of the grid,
   *    use the standard widths.
   *
   *  - If a column is resized, it should always use that width
   *
   *  - The proporational widths should never fall below min size if specified.
   *
   *  - If the grid starts off small but then becomes greater than the size ( + / - )
   *    the width should use the orginial width; not the newly proporatied widths.
   *
   * @param {array} allColumns
   * @param {int} expectedWidth
   */
  function ForceFillColumnWidths(allColumns, expectedWidth, startIdx) {
    var contentWidth = 0;
    var columnsToResize = startIdx > -1 ? allColumns.slice(startIdx, allColumns.length).filter(function (c) {
      return c.canAutoResize;
    }) : allColumns.filter(function (c) {
      return c.canAutoResize;
    });

    allColumns.forEach(function (c) {
      if (!c.canAutoResize) {
        contentWidth += c.width;
      } else {
        contentWidth += c.$$oldWidth || c.width;
      }
    });

    var remainingWidth = expectedWidth - contentWidth;
    var additionWidthPerColumn = remainingWidth / columnsToResize.length;
    var exceedsWindow = contentWidth > expectedWidth;

    columnsToResize.forEach(function (column) {
      if (exceedsWindow) {
        column.width = column.$$oldWidth || column.width;
      } else {
        if (!column.$$oldWidth) {
          column.$$oldWidth = column.width;
        }

        var newSize = column.$$oldWidth + additionWidthPerColumn;
        if (column.minWith && newSize < column.minWidth) {
          column.width = column.minWidth;
        } else if (column.maxWidth && newSize > column.maxWidth) {
          column.width = column.maxWidth;
        } else {
          column.width = newSize;
        }
      }
    });
  }

  var DataTableController = function () {
    /**
     * Creates an instance of the DataTable Controller
     * @param  {scope}
     * @param  {filter}
     */

    /* @ngInject */
    DataTableController.$inject = ["$scope", "$filter", "$q", "$attrs"];
    function DataTableController($scope, $filter, $q, $attrs) {
      _classCallCheck(this, DataTableController);

      _extends(this, {
        $scope: $scope,
        $filter: $filter,
        $q: $q,
        $attrs: $attrs
      });

      if (isOldAngular()) {
        this.$onInit();
      }
    }

    _createClass(DataTableController, [{
      key: '$onInit',
      value: function $onInit() {
        this.init();
      }
    }, {
      key: 'init',
      value: function init() {
        var _this = this;

        this.defaults();

        // set scope to the parent
        this.options.$outer = this.$scope.$parent;

        this.$scope.$watch('dt.options.columns', function (newVal, oldVal) {
          _this.transposeColumnDefaults();

          if (newVal.length !== oldVal.length) {
            _this.adjustColumns();
          }

          _this.calculateColumns();
        }, true);

        this.$scope.$watchCollection('dt.rows', function (newVal, oldVal) {
          if (newVal && oldVal && newVal.length > oldVal.length) {

            _this.onSorted();
          }
        });
      }
    }, {
      key: 'defaults',
      value: function defaults() {
        var _this2 = this;

        this.expanded = this.expanded || {};

        this.options = _extends({}, TableDefaults, this.options);

        angular.forEach(TableDefaults.paging, function (v, k) {
          if (!_this2.options.paging[k]) {
            _this2.options.paging[k] = v;
          }
        });

        if (this.options.selectable && this.options.multiSelect) {
          this.selected = this.selected || [];

          this.$scope.$watch('dt.selected', function () {
            angular.forEach(_this2.options.columns, function (column) {
              if (column.headerCheckbox && angular.isFunction(column.headerCheckboxCallback)) {
                column.headerCheckboxCallback(_this2);
              }
            });
          }, true);
        }
      }
    }, {
      key: 'transposeColumnDefaults',
      value: function transposeColumnDefaults() {
        var _this3 = this;

        var _loop2 = function _loop2(i, len) {
          var column = _this3.options.columns[i];
          column.$id = ObjectId();

          angular.forEach(ColumnDefaults, function (v, k) {
            if (!Object.prototype.hasOwnProperty.call(column, k)) {
              column[k] = v;
            }
          });

          if (column.name && !column.prop) {
            column.prop = CamelCase(column.name);
          }

          _this3.options.columns[i] = column;
        };

        for (var i = 0, len = this.options.columns.length; i < len; i += 1) {
          _loop2(i, len);
        }
      }
    }, {
      key: 'inheritColumnSortableProps',
      value: function inheritColumnSortableProps() {
        var _this4 = this;

        angular.forEach(this.options.columns, function (column) {
          column.sortable = angular.isDefined(column.sortable) ? column.sortable : _this4.options.sortable;
        });
      }
    }, {
      key: 'calculateColumns',
      value: function calculateColumns() {
        var columns = this.options.columns;
        this.columnsByPin = ColumnsByPin(columns);
        this.columnWidths = ColumnGroupWidths(this.columnsByPin, columns);
      }
    }, {
      key: 'tableCss',
      value: function tableCss() {
        return {
          fixed: this.options.scrollbarV,
          selectable: this.options.selectable,
          checkboxable: this.options.checkboxSelection
        };
      }
    }, {
      key: 'adjustColumns',
      value: function adjustColumns(forceIdx) {
        var width = this.options.internal.innerWidth - this.options.internal.scrollBarWidth;

        if (this.options.columnMode === 'force') {
          ForceFillColumnWidths(this.options.columns, width, forceIdx);
        } else if (this.options.columnMode === 'flex') {
          AdjustColumnWidths(this.options.columns, width);
        }
      }
    }, {
      key: 'calculatePageSize',
      value: function calculatePageSize() {
        this.options.paging.size = Math.ceil(this.options.internal.bodyHeight / this.options.rowHeight) + 1;
      }
    }, {
      key: 'onSorted',
      value: function onSorted() {
        if (!this.rows) {
          return;
        }

        // return all sorted column, in the same order in which they were sorted
        var sorts = this.options.columns.filter(function (c) {
          return c.sort;
        }).sort(function (a, b) {
          // sort the columns with lower sortPriority order first
          if (a.sortPriority && b.sortPriority) {
            if (a.sortPriority > b.sortPriority) return 1;
            if (a.sortPriority < b.sortPriority) return -1;
          } else if (a.sortPriority) {
            return -1;
          } else if (b.sortPriority) {
            return 1;
          }

          return 0;
        }).map(function (c, i) {
          // update sortPriority
          c.sortPriority = i + 1;
          return c;
        });

        if (sorts.length) {
          if (this.onSort) {
            this.onSort({ sorts: sorts });
          }

          if (this.options.onSort) {
            this.options.onSort(sorts);
          }

          var clientSorts = [];

          for (var i = 0, len = sorts.length; i < len; i += 1) {
            var c = sorts[i];
            if (c.comparator !== false) {
              var dir = c.sort === 'asc' ? '' : '-';
              if (angular.isDefined(c.sortBy)) {
                clientSorts.push(dir + c.sortBy);
              } else {
                clientSorts.push(dir + c.prop);
              }
            }
          }

          if (clientSorts.length) {
            var _rows;

            // todo: more ideal to just resort vs splice and repush
            // but wasn't responding to this change ...
            var sortedValues = this.$filter('orderBy')(this.rows, clientSorts);
            this.rows.splice(0, this.rows.length);
            (_rows = this.rows).push.apply(_rows, _toConsumableArray(sortedValues));
          }
        }

        if (this.options.internal && this.options.internal.setYOffset) {
          this.options.internal.setYOffset(0);
        }
      }
    }, {
      key: 'onTreeToggled',
      value: function onTreeToggled(row, cell) {
        this.onTreeToggle({
          row: row,
          cell: cell
        });
      }
    }, {
      key: 'onTreeLoad',
      value: function onTreeLoad(row, cell) {
        return this.onTreeLoader({
          row: row,
          cell: cell
        });
      }
    }, {
      key: 'onBodyPage',
      value: function onBodyPage(offset, size) {
        this.onPage({
          offset: offset,
          size: size
        });
      }
    }, {
      key: 'onFooterPage',
      value: function onFooterPage(offset, size) {
        var pageBlockSize = this.options.rowHeight * size;
        var offsetY = pageBlockSize * offset;

        this.options.internal.setYOffset(offsetY);
      }
    }, {
      key: 'selectAllRows',
      value: function selectAllRows() {
        var _selected;

        this.selected.splice(0, this.selected.length);

        (_selected = this.selected).push.apply(_selected, _toConsumableArray(this.rows));

        return this.isAllRowsSelected();
      }
    }, {
      key: 'deselectAllRows',
      value: function deselectAllRows() {
        this.selected.splice(0, this.selected.length);

        return this.isAllRowsSelected();
      }
    }, {
      key: 'isAllRowsSelected',
      value: function isAllRowsSelected() {
        return !this.rows || !this.selected ? false : this.selected.length === this.rows.length;
      }
    }, {
      key: 'onResized',
      value: function onResized(column, width) {
        var idx = this.options.columns.indexOf(column);

        var localColumn = column;

        if (idx > -1) {
          localColumn = this.options.columns[idx];
          column.width = width;
          column.canAutoResize = false;

          this.adjustColumns(idx);
          this.calculateColumns();
        }

        if (this.onColumnResize) {
          this.onColumnResize({
            column: localColumn,
            width: width
          });
        }
      }
    }, {
      key: 'onSelected',
      value: function onSelected(rows) {
        this.onSelect({
          rows: rows
        });
      }
    }, {
      key: 'onRowClicked',
      value: function onRowClicked(row) {
        this.onRowClick({
          row: row
        });
      }
    }, {
      key: 'onRowDblClicked',
      value: function onRowDblClicked(row) {
        this.onRowDblClick({
          row: row
        });
      }
    }, {
      key: 'moveRow',
      value: function moveRow(rowFrom, rowTo) {
        if (!this.$attrs.onMoveRow) {
          return this.$q.resolve();
        }
        var promise = this.onMoveRow({ rowFrom: rowFrom, rowTo: rowTo });
        if (!(promise instanceof this.$q)) {
          throw new Error('onMoveRow must return $q instance');
        }
        return promise;
      }
    }]);

    return DataTableController;
  }();

  /**
   * Debounce helper
   * @param  {function}
   * @param  {int}
   * @param  {boolean}
   */

  /**
   * Throttle helper
   * @param  {function}
   * @param  {boolean}
   * @param  {object}
   */
  function throttle(func, wait, options) {
    var _this5 = this;

    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var localOptions = options || (options = {});

      var result = void 0;
      var timeout = null;
      var previous = 0;

      var later = function later() {
        previous = localOptions.leading === false ? 0 : new Date();
        timeout = null;
        result = func.apply(_this5, args);
      };

      var now = new Date();
      if (!previous && localOptions.leading === false) {
        previous = now;
      }
      var remaining = wait - (now - previous);

      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(_this5, args);
      } else if (!timeout && localOptions.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  }

  var DataTableService = {

    // id: [ column defs ]
    columns: {},
    dTables: {},

    saveColumns: function saveColumns(id, columnElms) {
      if (columnElms && columnElms.length) {
        var columnsArray = [].slice.call(columnElms);
        this.dTables[id] = columnsArray;
      }
    },
    buildColumns: function buildColumns(scope, parse) {
      var _this6 = this;

      // FIXME: Too many nested for loops.  O(n3)

      // Iterate through each dTable
      angular.forEach(this.dTables, function (columnElms, id) {
        _this6.columns[id] = [];

        // Iterate through each column
        angular.forEach(columnElms, function (c) {
          var column = {};

          var visible = true;
          // Iterate through each attribute
          angular.forEach(c.attributes, function (attr) {
            var attrName = CamelCase(attr.name);

            // cuz putting className vs class on
            // a element feels weird
            switch (attrName) {
              case 'class':
                column.className = attr.value;
                break;
              case 'name':
              case 'prop':
                column[attrName] = attr.value;
                break;
              case 'headerRenderer':
              case 'cellRenderer':
              case 'cellDataGetter':
                column[attrName] = parse(attr.value);
                break;
              case 'visible':
                visible = parse(attr.value)(scope);
                break;
              default:
                column[attrName] = parse(attr.value)(scope);
                break;
            }
          });

          var header = c.getElementsByTagName('column-header');

          if (header.length) {
            column.headerTemplate = header[0].innerHTML;
            c.removeChild(header[0]);
          }

          if (c.innerHTML !== '') {
            column.template = c.innerHTML;
          }

          if (visible) {
            _this6.columns[id].push(column);
          }
        });
      });

      this.dTables = {};
    }
  };

  function DataTableDirective($window, $timeout, $parse) {
    return {
      restrict: 'E',
      replace: true,
      controller: DataTableController,
      scope: true,
      bindToController: {
        options: '=',
        rows: '=',
        selected: '=?',
        expanded: '=?',
        onSelect: '&',
        onSort: '&',
        //onFilter: '&', //bgmd
        onTreeToggle: '&',
        onPage: '&',
        onRowClick: '&',
        onRowDblClick: '&',
        onColumnResize: '&',
        onTreeLoader: '&',
        onMoveRow: '&'
      },
      controllerAs: 'dt',
      template: function template(element) {
        // Gets the column nodes to transposes to column objects
        // http://stackoverflow.com/questions/30845397/angular-expressive-directive-design/30847609#30847609
        var columns = element[0].getElementsByTagName('column');
        var id = ObjectId();

        DataTableService.saveColumns(id, columns);

        return '<div class="dt" ng-class="dt.tableCss()" data-column-id="' + id + '">\n          <dt-header options="dt.options"\n                     columns="dt.columnsByPin"\n                     column-widths="dt.columnWidths"\n                     ng-if="dt.options.headerHeight"\n                     on-resize="dt.onResized(column, width)"\n                     selected-rows="dt.selected"\n                     all-rows="dt.rows"\n                     on-sort="dt.onSorted()">\n          </dt-header>\n          <dt-body rows="dt.rows"\n                   selected="dt.selected"\n                   expanded="dt.expanded"\n                   columns="dt.columnsByPin"\n                   on-select="dt.onSelected(rows)"\n                   on-row-click="dt.onRowClicked(row)"\n                   on-row-dbl-click="dt.onRowDblClicked(row)"\n                   column-widths="dt.columnWidths"\n                   options="dt.options"\n                   on-page="dt.onBodyPage(offset, size)"\n                   on-tree-toggle="dt.onTreeToggled(row, cell)"\n                   on-tree-loader="dt.onTreeLoad(row, cell)"   \n                   on-move-row="dt.moveRow(rowFrom, rowTo)">   \n           </dt-body>\n          <dt-footer ng-if="dt.options.footerHeight || dt.options.paging.mode"\n                     ng-style="{ height: dt.options.footerHeight + \'px\' }"\n                     on-page="dt.onFooterPage(offset, size)"\n                     paging="dt.options.paging">\n           </dt-footer>\n        </div>';
      },
      compile: function compile() {
        return {
          pre: function pre($scope, $elm, $attrs, ctrl) {
            DataTableService.buildColumns($scope, $parse);

            // Check and see if we had expressive columns
            // and if so, lets use those
            var id = $elm.attr('data-column-id');
            var columns = DataTableService.columns[id];

            if (columns) {
              ctrl.options.columns = columns;
            }

            //ctrl.setFilterTemplate(); //bgmd

            ctrl.inheritColumnSortableProps();
            ctrl.transposeColumnDefaults();
            ctrl.options.internal.scrollBarWidth = ScrollbarWidth();

            /**
             * Invoked on init of control or when the window is resized;
             */
            function resize() {
              var rect = $elm[0].getBoundingClientRect();

              ctrl.options.internal.innerWidth = Math.floor(rect.width);

              if (ctrl.options.scrollbarV) {
                var height = rect.height;

                if (ctrl.options.headerHeight) {
                  height -= ctrl.options.headerHeight;
                }

                if (ctrl.options.footerHeight) {
                  height -= ctrl.options.footerHeight;
                }

                ctrl.options.internal.bodyHeight = height;
                ctrl.calculatePageSize();
              }

              ctrl.adjustColumns();
            }

            function calculateResize() {
              throttle(function () {
                $timeout(resize);
              });
            }

            $window.addEventListener('resize', calculateResize);

            // When an item is hidden for example
            // in a tab with display none, the height
            // is not calculated correrctly.  We need to watch
            // the visible attribute and resize if this occurs
            var checkVisibility = function checkVisibility() {
              var bounds = $elm[0].getBoundingClientRect();
              var visible = bounds.width && bounds.height;

              if (visible) {
                resize();
                $timeout(checkSize, 500);
              } else {
                $timeout(checkVisibility, 100);
              }
            };

            var checkSize = function checkSize() {
              var el1 = document.getElementsByClassName('dt-body');
              if ($elm[0].offsetHeight - el1[0].offsetHeight > 100) resize();
            };

            checkVisibility();

            // add a loaded class to avoid flickering
            $elm.addClass('dt-loaded');

            // prevent memory leaks
            $scope.$on('$destroy', function () {
              angular.element($window).off('resize');
            });
          }
        };
      }
    };
  }

  var cache = {};
  var testStyle = document.createElement('div').style;

  // Get Prefix
  // http://davidwalsh.name/vendor-prefix
  var prefix = function getPrefix() {
    var styles = window.getComputedStyle(document.documentElement, '');
    var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
    var dom = 'WebKit|Moz|MS|O'.match(new RegExp('(' + pre + ')', 'i'))[1];

    return {
      dom: dom,
      lowercase: pre,
      css: '-' + pre + '-',
      js: pre[0].toUpperCase() + pre.substr(1)
    };
  }();

  /**
   * @param {string} property Name of a css property to check for.
   * @return {?string} property name supported in the browser, or null if not
   * supported.
   */
  function GetVendorPrefixedName(property) {
    var name = CamelCase(property);
    if (!cache[name]) {
      if (angular.isDefined(testStyle[prefix.css + property])) {
        cache[name] = prefix.css + property;
      } else if (angular.isDefined(testStyle[property])) {
        cache[name] = property;
      }
    }
    return cache[name];
  }

  // browser detection and prefixing tools
  var ua = window.navigator.userAgent;
  var transform = GetVendorPrefixedName('transform');
  var backfaceVisibility = GetVendorPrefixedName('backfaceVisibility');
  var hasCSSTransforms = !!GetVendorPrefixedName('transform');
  var hasCSS3DTransforms = !!GetVendorPrefixedName('perspective');
  var isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua);

  function TranslateXY(styles, x, y) {
    if (hasCSSTransforms) {
      if (!isSafari && hasCSS3DTransforms) {
        styles[transform] = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        styles[backfaceVisibility] = 'hidden';
      } else {
        styles[CamelCase(transform)] = 'translate(' + x + 'px, ' + y + 'px)';
      }
    } else {
      styles.top = y + 'px';
      styles.left = x + 'px';
    }
  }

  var HeaderController = function () {
    function HeaderController() {
      _classCallCheck(this, HeaderController);
    }

    _createClass(HeaderController, [{
      key: 'styles',
      value: function styles() {
        return {
          width: this.options.internal.innerWidth + 'px',
          height: this.options.headerHeight + 'px'
        };
      }
    }, {
      key: 'innerStyles',
      value: function innerStyles() {
        return {
          width: this.columnWidths.total + 'px'
        };
      }
    }, {
      key: 'onSorted',
      value: function onSorted(sortedColumn, modifierPressed) {
        // if sort type is single, then only one column can be sorted at once,
        // so we set the sort to undefined for the other columns
        function unsortColumn(column) {
          if (column !== sortedColumn) {
            column.sort = undefined;
          }
        }

        if (this.options.sortType === 'single' && !(this.options.modifierActive && modifierPressed) || this.options.sortType === 'multiple' && this.options.modifierActive && modifierPressed) {
          this.columns.left.forEach(unsortColumn);
          this.columns.center.forEach(unsortColumn);
          this.columns.right.forEach(unsortColumn);
        }

        this.onSort({
          column: sortedColumn
        });
      }
    }, {
      key: 'onFilter',
      value: function onFilter(column, filterKeywords) {
        this.onFiltered({ column: column, filterKeywords: filterKeywords });
      }
    }, {
      key: 'stylesByGroup',
      value: function stylesByGroup(group) {
        var styles = {
          width: this.columnWidths[group] + 'px'
        };

        if (group === 'center') {
          TranslateXY(styles, this.options.internal.offsetX * -1, 0);
        } else if (group === 'right') {
          var offset = (this.columnWidths.total - this.options.internal.innerWidth) * -1;
          TranslateXY(styles, offset, 0);
        }

        return styles;
      }
    }, {
      key: 'onResized',
      value: function onResized(column, width) {
        this.onResize({
          column: column,
          width: width
        });
      }
    }]);

    return HeaderController;
  }();

  function HeaderDirective($timeout) {
    return {
      restrict: 'E',
      controller: HeaderController,
      controllerAs: 'header',
      scope: true,
      bindToController: {
        options: '=',
        columns: '=',
        columnWidths: '=',
        selectedRows: '=?',
        allRows: '=',
        onSort: '&',
        onFiltered: '&',
        onReordered: '&',
        onResize: '&'
      },
      template: '\n      <div class="dt-header" ng-style="header.styles()">\n        <div class="dt-header-inner" ng-style="header.innerStyles()">\n          <div class="dt-row-left"\n               ng-style="header.stylesByGroup(\'left\')"\n               ng-if="header.columns[\'left\'].length"\n               sortable="header.options.reorderable"\n               on-sortable-sort="columnsResorted(event, columnId)">\n            <dt-header-cell\n              ng-repeat="column in header.columns[\'left\'] track by column.$id"\n              on-sort="header.onSorted(column, modifierPressed)"\n              on-filter="header.onFilter(column, filterKeywords)"\n              options="header.options"\n              sort-type="header.options.sortType"\n              on-resize="header.onResized(column, width)"\n              all-rows="header.allRows"\n              column="column">\n            </dt-header-cell>\n          </div>\n          <div class="dt-row-center"\n               sortable="header.options.reorderable"\n               ng-style="header.stylesByGroup(\'center\')"\n               on-sortable-sort="columnsResorted(event, columnId)">\n            <dt-header-cell\n              ng-repeat="column in header.columns[\'center\'] track by column.$id"\n              on-checkbox-change="header.onCheckboxChanged()"\n              on-sort="header.onSorted(column, modifierPressed)"\n              on-filter="header.onFilter(column, filterKeywords)"\n              sort-type="header.options.sortType"\n              selected="header.isSelected()"\n              on-resize="header.onResized(column, width)"\n              options="header.options"\n              column="column">\n            </dt-header-cell>\n          </div>\n          <div class="dt-row-right"\n               ng-if="header.columns[\'right\'].length"\n               sortable="header.options.reorderable"\n               ng-style="header.stylesByGroup(\'right\')"\n               on-sortable-sort="columnsResorted(event, columnId)">\n            <dt-header-cell\n              ng-repeat="column in header.columns[\'right\'] track by column.$id"\n              on-checkbox-change="header.onCheckboxChanged()"\n              on-sort="header.onSorted(column, modifierPressed)"\n              on-filter="header.onFilter(column, filterKeywords)"\n              sort-type="header.options.sortType"\n              selected="header.isSelected()"\n              on-resize="header.onResized(column, width)"\n              options="header.options"\n              column="column">\n            </dt-header-cell>\n          </div>\n        </div>\n      </div>',
      replace: true,
      link: function link($scope, $elm, $attrs, ctrl) {
        $scope.columnsResorted = function columnsResorted(event, columnId) {
          var col = findColumnById(columnId);
          var parent = angular.element(event.currentTarget);

          var newIdx = -1;

          angular.forEach(parent.children(), function (c, i) {
            if (columnId === angular.element(c).attr('data-id')) {
              newIdx = i;
            }
          });

          $timeout(function () {
            angular.forEach(ctrl.columns, function (group) {
              var idx = group.indexOf(col);
              if (idx > -1) {
                // this is tricky because we want to update the index
                // in the orig columns array instead of the grouped one
                var curColAtIdx = group[newIdx];
                var siblingIdx = ctrl.options.columns.indexOf(curColAtIdx);
                var curIdx = ctrl.options.columns.indexOf(col);

                ctrl.options.columns.splice(curIdx, 1);
                ctrl.options.columns.splice(siblingIdx, 0, col);

                return false;
              }

              return undefined;
            });
            ctrl.onReordered(); //bgmd 
          });
        };

        var findColumnById = function findColumnById(columnId) {
          var columns = ctrl.columns.left.concat(ctrl.columns.center).concat(ctrl.columns.right);
          return columns.find(function (c) {
            return c.$id === columnId;
          });
        };
      }
    };
  }

  var HeaderCellController = function () {
    /* @ngInject */
    HeaderCellController.$inject = ["$scope"];
    function HeaderCellController($scope) {
      _classCallCheck(this, HeaderCellController);

      _extends(this, {
        $scope: $scope
      });

      if (isOldAngular()) {
        this.$onInit();
      }
    }

    _createClass(HeaderCellController, [{
      key: '$onInit',
      value: function $onInit() {
        this.init();
      }
    }, {
      key: 'init',
      value: function init() {
        var _this7 = this;

        if (this.column.headerCheckbox) {
          this.column.headerCheckboxCallback = this.rowSelected;
        }

        if (this.$scope.$parent.$parent.$parent.$parent.dt) {
          this.dt = this.$scope.$parent.$parent.$parent.$parent.dt;
        }
        //bgmd
        if (this.column.filter) {
          var self = this;
          this.$scope.$watch(function () {
            return _this7.column.filterKeywords;
          }, function (newVal) {
            if (!angular.isUndefined(newVal)) self.onFilter({
              column: self.column,
              filterKeywords: newVal
            });
          });
        }
      }
    }, {
      key: 'styles',
      value: function styles() {
        return {
          width: this.column.width + 'px',
          minWidth: this.column.minWidth + 'px',
          maxWidth: this.column.maxWidth + 'px',
          height: this.column.height ? this.column.height + 'px' : '100%'
        };
      }
    }, {
      key: 'cellClass',
      value: function cellClass() {
        var cls = {
          sortable: this.column.sortable,
          resizable: this.column.resizable
        };

        if (this.column.headerClassName) {
          cls[this.column.headerClassName] = true;
        }

        return cls;
      }
    }, {
      key: 'onSorted',
      value: function onSorted(event) {
        if (this.column.sortable) {
          this.column.sort = NextSortDirection(this.sortType, this.column.sort);

          if (angular.isUndefined(this.column.sort)) {
            this.column.sortPriority = undefined;
          }

          this.onSort({
            column: this.column,
            modifierPressed: event.shiftKey
          });
        }
      }
    }, {
      key: 'onFilterClick',
      value: function onFilterClick($event) {
        $event.stopPropagation();
      }
    }, {
      key: 'sortClass',
      value: function sortClass() {
        return {
          'sort-btn': true,
          'sort-asc icon-down': this.column.sort === 'asc',
          'sort-desc icon-up': this.column.sort === 'desc'
        };
      }
    }, {
      key: 'onResized',
      value: function onResized(width, column) {
        this.onResize({
          column: column,
          width: width
        });
      }
    }, {
      key: 'rowSelected',
      value: function rowSelected(dt) {
        this.allRowsSelected = dt.selected && dt.rows.length === dt.selected.length;
      }
    }, {
      key: 'checkboxChangeCallback',
      value: function checkboxChangeCallback() {
        this.isAllRowsSelected = this.column.allRowsSelected;

        return this.isAllRowsSelected ? this.dt.selectAllRows() : this.dt.deselectAllRows();
      }
    }]);

    return HeaderCellController;
  }();

  function HeaderCellDirective($compile) {
    return {
      restrict: 'E',
      controller: HeaderCellController,
      controllerAs: 'hcell',
      scope: true,
      bindToController: {
        options: '=',
        column: '=',
        onSort: '&',
        onFilter: '&', //bgmd
        sortType: '=',
        onResize: '&',
        selected: '='
      },
      replace: true,
      template: '<div ng-class="hcell.cellClass()"\n            class="dt-header-cell"\n            draggable="true"\n            data-id="{{column.$id}}"\n            ng-style="hcell.styles()"\n            style="height:100%;"\n            title="{{::hcell.column.name}}">\n        <div resizable="hcell.column.resizable"\n             on-resize="hcell.onResized(width, hcell.column)"\n             min-width="hcell.column.minWidth"\n             max-width="hcell.column.maxWidth">\n          <label ng-if="hcell.column.isCheckboxColumn && hcell.column.headerCheckbox" class="dt-checkbox">\n            <input type="checkbox"\n                   ng-model="hcell.column.allRowsSelected"\n                   ng-change="hcell.checkboxChangeCallback()" />\n          </label>\n          <span class="dt-header-cell-label"\n                ng-click="hcell.onSorted($event)">\n          </span>\n          <span ng-class="hcell.sortClass()">{{hcell.column.sortPriority}}</span>\n          <div ng-if="hcell.column.filter">\n            <input type="{{hcell.column.filter}}" ng-model-options="{ debounce: 500 }" placeholder="{{hcell.options.filterPlaceholder + \' \' + hcell.column.name}}" ng-click="hcell.onFilterClick($event)" ng-model="hcell.column.filterKeywords" style="width:99%;"/>\n          </div>\n        </div>\n      </div>',
      compile: function compile() {
        return {
          pre: function pre($scope, $elm, $attrs, ctrl) {
            var label = $elm[0].querySelector('.dt-header-cell-label');

            var cellScope = void 0;

            if (ctrl.column.headerTemplate || ctrl.column.headerRenderer || ctrl.column.headerFilterTemplate) {
              cellScope = ctrl.options.$outer.$new(false);

              // copy some props
              cellScope.$header = ctrl.column.name;
              cellScope.$index = $scope.$index;
            }

            if (ctrl.column.headerTemplate) {
              var el = '<span>' + ctrl.column.headerTemplate.trim() + '</span>';
              //if (ctrl.column.headerFilterTemplate)
              //  el += '<br>' + ctrl.column.headerFilterTemplate;  
              var elm = angular.element(el);
              angular.element(label).append($compile(elm)(cellScope));
            } else if (ctrl.column.headerRenderer) {
              var _el = ctrl.column.headerRenderer($elm);
              //if (ctrl.column.headerFilterTemplate)
              //  el += '<br>' + ctrl.column.headerFilterTemplate;  
              var _elm = angular.element(_el);
              angular.element(label).append($compile(_elm)(cellScope)[0]);
            } else {
              var val = ctrl.column.name;
              if (angular.isUndefined(val) || val === null) val = '';
              /*if (ctrl.column.headerFilterTemplate) {
                let el = `<span>${val}</span><br>` + ctrl.column.headerFilterTemplate;
                const elm = angular.element(el);
                angular.element(label).append($compile(elm)(cellScope));
              }
              else*/
              label.textContent = val;
            }
          }
        };
      }
    };
  }

  var TREE_TYPES = {
    GROUP: 'refreshGroups',
    TREE: 'refreshTree'
  };

  var BodyController = function () {
    /**
     * A body controller
     * @param  {$scope}
     * @return {BodyController}
     */

    /* @ngInject */
    BodyController.$inject = ["$scope"];
    function BodyController($scope) {
      _classCallCheck(this, BodyController);

      _extends(this, {
        $scope: $scope
      });

      if (isOldAngular()) {
        this.$onInit();
      }
    }

    _createClass(BodyController, [{
      key: '$onInit',
      value: function $onInit() {
        this.init();
      }
    }, {
      key: 'init',
      value: function init() {
        var _this8 = this;

        this.tempRows = [];
        this.watchListeners = [];
        //bgmd
        this.loading = [];

        this.setTreeAndGroupColumns();
        this.setConditionalWatches();

        this.$scope.$watch('body.options.columns', function (newVal) {
          if (newVal) {
            var filter = _this8.filterChanged();
            if (filter) {
              if (_this8.treeColumn || _this8.groupColumn) {
                _this8._applyFilter = filter;
                _this8.rowsUpdated();
              } else _this8.rows = _this8.doFilter(filter);
              return;
            }
            var origTreeColumn = angular.copy(_this8.treeColumn);
            var origGroupColumn = angular.copy(_this8.groupColumn);

            _this8.setTreeAndGroupColumns();

            _this8.setConditionalWatches();

            if (_this8.treeColumn && origTreeColumn !== _this8.treeColumn || _this8.groupColumn && origGroupColumn !== _this8.groupColumn) {
              _this8.rowsUpdated(_this8.rows);

              if (_this8.treeColumn) {
                _this8.refreshTree();
              } else if (_this8.groupColumn) {
                _this8.refreshGroups();
              }
            }
            _this8.createFilters();
          }
        }, true);

        var self = this;
        this.$scope.$watchCollection('body.rows', function (newVal, oldVal) {
          //this.rowsUpdated.bind(this));
          if (newVal && self.treeColumn && !self._dueFiltering_) {
            self.filteredRows = self.doFilter();
          }
          self._dueFiltering_ = false;
          self.rowsUpdated(newVal, oldVal);
        });
      }
    }, {
      key: 'setTreeAndGroupColumns',
      value: function setTreeAndGroupColumns() {
        if (this.options && this.options.columns) {
          this.treeColumn = this.options.columns.find(function (c) {
            return c.isTreeColumn;
          });

          if (!this.treeColumn) {
            this.groupColumn = this.options.columns.find(function (c) {
              return c.group;
            });
          } else {
            this.groupColumn = undefined;
            if (!this.treeColumn.parentRelationProp) this.treeColumn.parentRelationProp = this.treeColumn.prop;
          }
        }
      }
    }, {
      key: 'buildInternalPage',
      value: function buildInternalPage() {
        var i = void 0;
        var rowsIndex = void 0;

        this.tempRows.splice(0, this.tempRows.length);

        for (i = 0; i < this.options.paging.size; i += 1) {
          rowsIndex = this.options.paging.offset * this.options.paging.size + i;

          if (angular.isDefined(this.rows[rowsIndex])) {
            this.tempRows[i] = this.rows[rowsIndex];
          }
        }
      }
    }, {
      key: 'setConditionalWatches',
      value: function setConditionalWatches() {
        var _this9 = this;

        for (var i = this.watchListeners.length - 1; i >= 0; i -= 1) {
          this.watchListeners[i]();

          this.watchListeners.splice(i, 1);
        }

        if (this.options && (this.options.scrollbarV || !this.options.scrollbarV && this.options.paging && this.options.paging.size)) {
          var sized = false;

          this.watchListeners.push(this.$scope.$watch('body.options.paging.size', function (newVal, oldVal) {
            if (!sized || newVal > oldVal) {
              _this9.getRows();
              sized = true;
            }
          }));

          this.watchListeners.push(this.$scope.$watch('body.options.paging.count', function (count) {
            _this9.count = count;
            _this9.updatePage();
          }));

          this.watchListeners.push(this.$scope.$watch('body.options.paging.offset', function (newVal) {
            if (_this9.options.paging.size) {
              if (_this9.options.paging.mode === 'internal') {
                _this9.buildInternalPage();
              }

              if (_this9.onPage) {
                _this9.onPage({
                  offset: newVal,
                  size: _this9.options.paging.size
                });
              }
            }
          }));
        }
      }
    }, {
      key: 'rowsUpdated',
      value: function rowsUpdated(newVal, oldVal) {
        if (this.noNeedRowsUpdated) {
          this.noNeedRowsUpdated = false;
          return;
        }
        if (!newVal) {
          this.getRows(true);
        } else {
          if (this.options.paging.mode !== 'external') {
            this.options.paging.count = newVal.length;
          }

          this.count = this.options.paging.count;

          if (this.treeColumn || this.groupColumn) {
            this.buildRowsByGroup();
          }

          if (this.options.scrollbarV) {
            var refresh = newVal && oldVal && newVal.length != oldVal.length;
            /*const refresh = newVal && oldVal && (newVal.length === oldVal.length
              || newVal.length < oldVal.length);*/
            this.getRows(refresh);
          } else {
            var rows = this.rows;

            if (this.treeColumn) {
              rows = this.buildTree();
            } else if (this.groupColumn) {
              rows = this.buildGroups();
            }

            if (this.options.paging.mode === 'external') {
              // We're using external paging
              var idxs = this.getFirstLastIndexes();
              var idx = idxs.first;

              this.tempRows.splice(0, this.tempRows.length);
              while (idx < idxs.last) {
                this.tempRows.push(rows[idx += 1]);
              }
            } else if (this.options.paging.mode === 'internal') {
              // We're using internal paging
              this.buildInternalPage();
            } else {
              var _tempRows;

              // No paging
              this.tempRows.splice(0, this.tempRows.length);
              (_tempRows = this.tempRows).push.apply(_tempRows, _toConsumableArray(rows));
            }
          }
        }
      }
    }, {
      key: 'getFirstLastIndexes',
      value: function getFirstLastIndexes() {
        var firstRowIndex = void 0;
        var endIndex = void 0;

        if (this.options.scrollbarV) {
          firstRowIndex = Math.max(Math.floor((this.options.internal.offsetY || 0) / this.options.rowHeight, 0), 0);
          endIndex = Math.min(firstRowIndex + this.options.paging.size, this.count);
        } else if (this.options.paging.mode === 'external') {
          firstRowIndex = Math.max(this.options.paging.offset * this.options.paging.size, 0);
          endIndex = Math.min(firstRowIndex + this.options.paging.size, this.count);
        } else {
          endIndex = this.count;
        }

        return {
          first: firstRowIndex,
          last: endIndex
        };
      }
    }, {
      key: 'updatePage',
      value: function updatePage() {
        var curPage = this.options.paging.offset;
        var idxs = this.getFirstLastIndexes();

        if (angular.isUndefined(this.options.internal.oldScrollPosition)) {
          this.options.internal.oldScrollPosition = 0;
        }

        var oldScrollPosition = this.options.internal.oldScrollPosition;
        var newPage = idxs.first / this.options.paging.size;

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
    }, {
      key: 'calculateDepth',
      value: function calculateDepth(row) {
        var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var parentProp = this.treeColumn ? this.treeColumn.relationProp : this.groupColumn.prop;
        var prop = this.treeColumn.prop;

        if (!row[parentProp]) {
          return depth;
        }

        if (row.$$depth) {
          return row.$$depth + depth;
        }

        /* Get data from cache, if exists*/
        var cachedParent = this.index[row[parentProp]];

        if (cachedParent) {
          depth += 1;
          return this.calculateDepth(cachedParent, depth);
        }

        for (var i = 0, len = this.rows.length; i < len; i += 1) {
          var parent = this.rows[i];
          if (parent[prop] === row[parentProp]) {
            depth += 1;
            return this.calculateDepth(parent, depth);
          }
        }

        return depth;
      }
    }, {
      key: 'buildRowsByGroup',
      value: function buildRowsByGroup() {
        this.index = {};
        this.rowsByGroup = {};

        var parentProp = this.treeColumn ? this.treeColumn.relationProp : this.groupColumn.prop;
        var treeProp = '';
        if (this.treeColumn) treeProp = this.treeColumn.parentRelationProp; //bgmd

        for (var i = 0, len = this.rows.length; i < len; i += 1) {
          var row = this.rows[i];

          //bgmd for lazy load
          if (row._lazyChildren) {
            if (treeProp && !this.rowsByGroup[row[treeProp]]) {
              this.rowsByGroup[row[treeProp]] = [];
            }
          }

          // build groups
          var relVal = row[parentProp];
          if (relVal) {
            if (this.rowsByGroup[relVal]) {
              this.rowsByGroup[relVal].push(row);
            } else {
              this.rowsByGroup[relVal] = [row];
            }
          }

          // build indexes
          if (this.treeColumn) {
            var prop = this.treeColumn.parentRelationProp;
            this.index[row[prop]] = row;

            if (angular.isUndefined(row[parentProp])) {
              row.$$depth = 0;
            } else {
              var parent = this.index[row[parentProp]];
              if (angular.isUndefined(parent)) {
                for (var j = 0; j < len; j += 1) {
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
                if (!parent.$$children.includes(row[prop])) parent.$$children.push(row[prop]);
              } else {
                parent.$$children = [row[prop]];
              }
            }
          }
        }
      }
    }, {
      key: 'buildGroups',
      value: function buildGroups() {
        var _this10 = this;

        var temp = [];

        angular.forEach(this.rowsByGroup, function (v, k) {
          temp.push({
            name: k,
            group: true
          });

          if (_this10.expanded[k]) {
            temp.push.apply(temp, _toConsumableArray(v));
          }
        });

        return temp;
      }
    }, {
      key: 'isSelected',
      value: function isSelected(row) {
        var selected = false;

        if (this.options.selectable) {
          if (this.options.multiSelect) {
            selected = this.selected.indexOf(row) > -1;
          } else {
            selected = this.selected === row;
          }
        }

        return selected;
      }
    }, {
      key: 'isDraggable',
      value: function isDraggable(row) {
        return this.options.rowDraggable;
      }
    }, {
      key: 'onDropRow',
      value: function onDropRow(event, indexFrom, indexTo) {
        var from = this.rows.find(function (value) {
          return value.$$index == indexFrom;
        });
        var parent = this.rows.find(function (value) {
          return value.$$index == indexTo;
        });
        var self = this;
        this.onMoveRow({ rowFrom: from, rowTo: parent }).then(function () {
          if (self.treeColumn) {
            if (parent) {
              if (parent._lazyChildren && !parent._loaded_) {
                //for node with lazy loading - children is not yet have been loaded
                //remove this row and her children
                self.removeTreeRows(from[self.treeColumn.parentRelationProp]);
              } else {
                //remove this child from old parent
                self.removeChild(from[self.treeColumn.relationProp], from[self.treeColumn.parentRelationProp]);
                //set new parent
                from[self.treeColumn.relationProp] = parent[self.treeColumn.parentRelationProp];
              }
            } else from[self.treeColumn.relationProp] = null;
            self.buildRowsByGroup();
            self.refreshTree();
          } else {
            //merely replace
            self.rows.move(indexFrom, indexTo);
            if (self.groupColumn) {
              self.refreshGroups();
            } else self.getRows(true);
          }
        }).catch(function (err) {
          return console.error(err);
        });
      }
    }, {
      key: 'removeChild',
      value: function removeChild(parentId, childId) {
        var key = this.treeColumn.parentRelationProp;
        var parent = this.rows.find(function (value) {
          return value[key] == parentId;
        });
        if (!parent) return;
        if (parent.$$children) {
          var i = parent.$$children.findIndex(function (child) {
            return child == childId;
          });
          if (i != -1) {
            parent.$$children.splice(i, 1);
          }
        }
      }
    }, {
      key: 'removeTreeRows',
      value: function removeTreeRows(id) {
        var _this11 = this;

        var key = this.treeColumn.parentRelationProp;
        var row = null;
        var index = this.rows.findIndex(function (value) {
          return value[key] == id;
        });
        if (index != -1) {
          row = this.rows[index];
        }
        if (row) {
          this.rows.splice(index, 1);
          if (this.expanded[id]) delete this.expanded[id];
          if (row.$$children) {
            row.$$children.forEach(function (child) {
              _this11.removeTreeRows(child);
            });
          }
        }
      }
    }, {
      key: 'buildTree',
      value: function buildTree() {
        var temp = [];
        var self = this;

        if (!this.filteredRows) this.filteredRows = this.rows;
        //rows filtering
        var flt = false;
        if (this._applyFilter) {
          this.filteredRows = this.doFilter(this._applyFilter);
          this._applyFilter = null;
          flt = true;
        }

        function addChildren(fromArray, toArray, level) {
          fromArray.forEach(function (row) {
            var relVal = row[self.treeColumn.relationProp];
            var key = row[self.treeColumn.parentRelationProp];
            var groupRows = self.rowsByGroup[key];
            if (flt && groupRows && groupRows.length > 0) self.expanded[key] = true;
            var expanded = self.expanded[key];

            if (level > 0 || !relVal) {
              if (self.filteredRows.includes(row)) toArray.push(row);
              if (groupRows && groupRows.length > 0 && expanded) {
                addChildren(groupRows, toArray, level + 1);
              }
            }
          });
        }

        addChildren(this.rows, temp, 0);

        return temp;
      }
    }, {
      key: 'getRows',
      value: function getRows(refresh) {
        // only proceed when we have pre-aggregated the values
        if ((this.treeColumn || this.groupColumn) && !this.rowsByGroup) {
          return false;
        }

        //clear $$index
        this.tempRows.forEach(function (value) {
          return delete value.$$index;
        });

        var temp = void 0;

        if (this.treeColumn) {
          temp = this.treeTemp || [];
          // cache the tree build
          if (refresh || !this.treeTemp) {
            this.treeTemp = temp = this.buildTree();
            this.count = temp.length;

            // have to force reset, optimize this later
            this.tempRows.splice(0, this.tempRows.length);
          }
        } else if (this.groupColumn) {
          temp = this.groupsTemp || [];
          // cache the group build
          if (refresh || !this.groupsTemp) {
            this.groupsTemp = temp = this.buildGroups();
            this.count = temp.length;
          }
        } else {
          temp = this.rows;
          if (refresh === true) {
            this.tempRows.splice(0, this.tempRows.length);
          }
        }

        var idx = 0;
        var indexes = this.getFirstLastIndexes();
        var rowIndex = indexes.first;

        // slice out the old rows so we don't have duplicates
        this.tempRows.splice(0, indexes.last - indexes.first);

        while (rowIndex < indexes.last && rowIndex < this.count) {
          var row = temp[rowIndex];

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
    }, {
      key: 'styles',
      value: function styles() {
        var styles = {
          width: this.options.internal.innerWidth + 'px'
        };

        if (!this.options.scrollbarV) {
          styles.overflowY = 'hidden';
        } else if (this.options.scrollbarH === false) {
          styles.overflowX = 'hidden';
        }

        if (this.options.scrollbarV) {
          styles.height = this.options.internal.bodyHeight + 'px';
        }

        return styles;
      }
    }, {
      key: 'rowStyles',
      value: function rowStyles() {
        var styles = {};

        if (this.options.rowHeight === 'auto') {
          styles.height = this.options.rowHeight + 'px';
        }

        return styles;
      }
    }, {
      key: 'groupRowStyles',
      value: function groupRowStyles(row) {
        var styles = this.rowStyles(row);
        styles.width = this.columnWidths.total + 'px';
        return styles;
      }
    }, {
      key: 'rowClasses',
      value: function rowClasses(row) {
        var styles = {
          selected: this.isSelected(row),
          'dt-row-even': row && row.$$index % 2 === 0,
          'dt-row-odd': row && row.$$index % 2 !== 0
        };

        if (this.treeColumn) {
          // if i am a child
          styles['dt-leaf'] = this.rowsByGroup[row[this.treeColumn.relationProp]];
          // if i have children
          styles['dt-has-leafs'] = this.rowsByGroup[row[this.treeColumn.parentRelationProp]];
          // the depth
          styles['dt-depth-' + row.$$depth] = true;
        }

        return styles;
      }
    }, {
      key: 'getRowValue',
      value: function getRowValue(idx) {
        return this.tempRows[idx];
      }
    }, {
      key: 'getRowExpanded',
      value: function getRowExpanded(row) {
        if (this.treeColumn) {
          return row && this.treeColumn.parentRelationProp ? this.expanded[row[this.treeColumn.parentRelationProp]] : false;
        } else if (this.groupColumn) {
          return this.expanded[row.name];
        }

        return undefined;
      }
    }, {
      key: 'getRowLoading',
      value: function getRowLoading(row) {
        if (this.treeColumn) {
          return this.loading[row[this.treeColumn.parentRelationProp]];
        } else if (this.groupColumn) {
          return this.loading[row.name];
        }
      }
    }, {
      key: 'refresh',
      value: function refresh(type) {
        if (this.options.scrollbarV) {
          this.getRows(true);
        } else {
          var _tempRows2;

          var values = this[type]();
          this.tempRows.splice(0, this.tempRows.length);
          (_tempRows2 = this.tempRows).push.apply(_tempRows2, _toConsumableArray(values));
        }
      }
    }, {
      key: 'getRowHasChildren',
      value: function getRowHasChildren(row) {
        if (!this.treeColumn) return undefined;

        var children = this.rowsByGroup[row[this.treeColumn.parentRelationProp]];

        return angular.isDefined(children) || children && !children.length;
      }
    }, {
      key: 'refreshTree',
      value: function refreshTree() {
        this.refresh(TREE_TYPES.TREE);
      }
    }, {
      key: 'onTreeToggled',
      value: function onTreeToggled(row, cell) {
        var val = row[this.treeColumn.parentRelationProp];
        //bgmd 
        var self = this;
        if (row._lazyChildren && !row._loaded_) {
          this.expanded[val] = false;
          this.loading[val] = true;
          this.onTreeLoad(row, cell).then(function (data) {
            row._loaded_ = true;
            self.rows = self.rows.concat(data);
            self.noNeedRowsUpdated = true;
            self.buildRowsByGroup();
            self.filteredRows = self.doFilter();
            self.onTreeToggledProcess(row, cell);
            self.loading[val] = false;
          }).catch(function (error) {
            self.loading[val] = false;
            console.error(error);
          });
        } else this.onTreeToggledProcess(row, cell);
      }
    }, {
      key: 'onTreeToggledProcess',
      value: function onTreeToggledProcess(row, cell) {
        var val = row[this.treeColumn.parentRelationProp];
        this.expanded[val] = !this.expanded[val];

        this.refreshTree();

        this.onTreeToggle({
          row: row,
          cell: cell
        });
      }
    }, {
      key: 'onTreeLoad',
      value: function onTreeLoad(row, cell) {
        return this.onTreeLoader({
          row: row,
          cell: cell
        });
      }
    }, {
      key: 'refreshGroups',
      value: function refreshGroups() {
        this.refresh(TREE_TYPES.GROUP);
      }
    }, {
      key: 'onGroupToggle',
      value: function onGroupToggle(row) {
        this.expanded[row.name] = !this.expanded[row.name];

        this.refreshGroups();
      }
    }, {
      key: 'filterChanged',
      value: function filterChanged() {
        if (!this.filters) return false;
        for (var i = 0; i < this.options.columns.length; i++) {
          var _column = this.options.columns[i];
          if (!_column.filter) continue;
          var filter = this.filters[_column.name];
          if (filter && filter.phrase != _column.filterKeywords) {
            filter.phrase = _column.filterKeywords;
            return filter; //{ col: column, filterKeywords: column.filterKeywords };
          }
        }
        return false;
      }
    }, {
      key: 'createFilters',
      value: function createFilters() {
        if (this.filters) {
          return this.headerReordered();
        }
        this.filters = {
          list: []
        };
        var self = this;
        this.options.columns.forEach(function (col, index) {
          if (!col.filter) return;
          var filter = {
            name: col.name,
            prop: col.prop,
            rowsBefore: null,
            rowsAfter: null,
            phrase: null,
            order: index
          };
          self.filters.list.push(filter);
          self.filters[col.name] = filter;
        });
      }
    }, {
      key: 'headerReordered',
      value: function headerReordered() {
        //console.info('onHeaderReorder');
        if (!this.filters || !this.filters.list.length) return;
        var initRows = this.filters.list[0].rowsBefore;
        //const list = this.filters.list;
        this.filters.list = [];
        var self = this;
        this.options.columns.forEach(function (col, index) {
          if (!col.filter) return;
          var filter = self.filters[col.name];
          filter.rowsBefore = null;
          filter.rowsAfter = null;
          filter.order = index;
          self.filters.list.push(filter);
        });
        if (this.filters.list.length) {
          this.filters.list[0].rowsBefore = initRows;
          this.filters.list[0].rowsAfter = initRows;
        }
        //filter rows again starting with first column
        this.rows = this.doFilter(this.filters.list[0]);
      }
    }, {
      key: 'filterPipe',
      value: function filterPipe(filter) {
        var _this12 = this;

        var result = this.rows;

        var _loop3 = function _loop3(i) {
          var f = _this12.filters.list[i];
          if (i > filter.order) {
            if (!f.phrase) {
              f.rowsBefore = null;
              f.rowsAfter = null;
              return 'continue';
            }
            f.rowsBefore = result;
          }
          result = f.rowsAfter = f.rowsBefore.filter(function (row) {
            return row[f.prop] && row[f.prop].toLowerCase().indexOf(f.phrase) !== -1 || !f.phrase;
          });
        };

        for (var i = filter.order; i < this.filters.list.length; i++) {
          var _ret3 = _loop3(i);

          if (_ret3 === 'continue') continue;
        }
        return result;
      }
    }, {
      key: 'doFilter',
      value: function doFilter(filter) {
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
            var i = filter.order - 1;
            while (i >= 0) {
              var prev = this.filters.list[i];
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
        var rows = this.filterPipe(filter);
        return rows;
      }
    }]);

    return BodyController;
  }();

  function BodyDirective() {
    return {
      restrict: 'E',
      controller: BodyController,
      controllerAs: 'body',
      bindToController: {
        columns: '=',
        columnWidths: '=',
        rows: '=',
        options: '=',
        selected: '=?',
        expanded: '=?',
        onPage: '&',
        onTreeToggle: '&',
        onTreeLoader: '&', //bgmd
        onSelect: '&',
        onRowClick: '&',
        onRowDblClick: '&',
        onMoveRow: '&'
      },
      scope: true,
      template: '\n      <div\n        class="progress-linear"\n        role="progressbar"\n        ng-show="body.options.loadingIndicator">\n        <div class="container">\n          <div class="bar"></div>\n        </div>\n      </div>\n      <div class="dt-body" ng-style="body.styles()" dt-selection \n               draggable-row="body.options.rowDraggable"\n               on-drop="body.onDropRow(event, indexFrom, indexTo)">\n        <dt-scroller class="dt-body-scroller">\n          <dt-group-row ng-repeat-start="r in body.tempRows track by $index"\n                        ng-if="r.group"\n                        ng-style="body.groupRowStyles(r)"\n                        options="body.options"\n                        on-group-toggle="body.onGroupToggle(group)"\n                        expanded="body.getRowExpanded(r)"\n                        loading="body.getRowLoading(r)"\n                        tabindex="{{$index}}"\n                        row="r">\n          </dt-group-row>\n          <dt-row ng-repeat-end\n                  ng-if="!r.group"\n                  row="body.getRowValue($index)"\n                  tabindex="{{$index}}"\n                  rowindex="{{r.$$index}}"\n                  columns="body.columns"\n                  column-widths="body.columnWidths"\n                  ng-keydown="selCtrl.keyDown($event, $index, r)"\n                  ng-click="selCtrl.rowClicked($event, r.$$index, r)"\n                  ng-dblclick="selCtrl.rowDblClicked($event, r.$$index, r)"\n                  on-tree-toggle="body.onTreeToggled(row, cell)"\n                  ng-class="body.rowClasses(r)"\n                  options="body.options"\n                  selected="body.isSelected(r)"\n                  on-checkbox-change="selCtrl.onCheckboxChange($event, $index, row)"\n                  columns="body.columnsByPin"\n                  has-children="body.getRowHasChildren(r)"\n                  expanded="body.getRowExpanded(r)"\n                  loading="body.getRowLoading(r)"\n                  ng-style="body.rowStyles(r)"\n                  is-draggable="body.isDraggable(r)">\n          </dt-row>\n        </dt-scroller>\n        <div ng-if="body.rows && !body.rows.length"\n             class="empty-row"\n             ng-bind="::body.options.emptyMessage">\n       </div>\n       <div ng-if="body.rows === undefined"\n             class="loading-row"\n             ng-bind="::body.options.loadingMessage">\n        </div>\n      </div>'
    };
  }

  /**
   * This translates the dom position based on the model row index.
   * This only exists because Angular's binding process is too slow.
   */

  var StyleTranslator = function () {
    function StyleTranslator(height) {
      _classCallCheck(this, StyleTranslator);

      this.height = height;
      this.map = new Map();
    }

    /**
     * Update the rows
     * @param  {Array} rows
     */


    _createClass(StyleTranslator, [{
      key: 'update',
      value: function update(rows) {
        var n = 0;
        while (n <= this.map.size) {
          var dom = this.map.get(n);
          var model = rows[n];

          if (dom && model) {
            TranslateXY(dom[0].style, 0, model.$$index * this.height);
          }

          n += 1;
        }
      }
    }, {
      key: 'register',
      value: function register(idx, dom) {
        this.map.set(idx, dom);
      }
    }]);

    return StyleTranslator;
  }();

  function ScrollerDirective() {
    return {
      restrict: 'E',
      require: '^dtBody',
      transclude: true,
      replace: true,
      template: '<div ng-style="scrollerStyles()" ng-transclude></div>',
      link: function link($scope, $elm, $attrs, ctrl) {
        var parent = $elm.parent();

        var ticking = false;
        var lastScrollY = 0;
        var lastScrollX = 0;

        ctrl.options.internal.styleTranslator = new StyleTranslator(ctrl.options.rowHeight);

        ctrl.options.internal.setYOffset = function (offsetY) {
          parent[0].scrollTop = offsetY;
        };

        function update() {
          ctrl.options.internal.offsetY = lastScrollY;
          ctrl.options.internal.offsetX = lastScrollX;
          ctrl.updatePage();

          if (ctrl.options.scrollbarV) {
            ctrl.getRows(true);
          }

          ctrl.options.$outer.$digest();

          ticking = false;
        }

        function requestTick() {
          if (!ticking) {
            requestAnimFrame(update);
            ticking = true;
          }
        }

        parent.on('scroll', function onScroll() {
          lastScrollY = this.scrollTop;
          lastScrollX = this.scrollLeft;

          requestTick();
        });

        $scope.$on('$destroy', function () {
          parent.off('scroll');
        });

        $scope.scrollerStyles = function () {
          if (ctrl.options.scrollbarV) {
            return {
              height: ctrl.count * ctrl.options.rowHeight + 'px'
            };
          }

          return undefined;
        };
      }
    };
  }

  /**
   * Shortcut for key handlers
   * @type {Object}
   */
  var KEYS = {
    BACKSPACE: 8,
    TAB: 9,
    RETURN: 13,
    ALT: 18,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    COMMA: 188,
    PERIOD: 190,
    A: 65,
    Z: 90,
    ZERO: 48,
    NUMPAD_0: 96,
    NUMPAD_9: 105
  };

  var SelectionController = function () {

    /* @ngInject*/
    SelectionController.$inject = ["$scope"];
    function SelectionController($scope) {
      _classCallCheck(this, SelectionController);

      this.$scope = $scope;
      this.body = $scope.body;
      this.options = $scope.body.options;
      this.selected = $scope.body.selected;

      if (isOldAngular()) {
        this.$onInit();
      }
    }

    _createClass(SelectionController, [{
      key: '$onInit',
      value: function $onInit() {
        this.init();
      }
    }, {
      key: 'init',
      value: function init() {
        if (this.options && this.options.columns) {
          this.hasTreeColumn = this.options.columns.find(function (c) {
            return c.isTreeColumn;
          }) != null;
        }
      }
    }, {
      key: 'keyDown',
      value: function keyDown(ev, index, row) {
        if (KEYS[ev.keyCode]) {
          ev.preventDefault();
        }

        if (ev.keyCode === KEYS.DOWN) {
          var next = ev.target.nextElementSibling;
          if (next) {
            next.focus();
          }
        } else if (ev.keyCode === KEYS.UP) {
          var prev = ev.target.previousElementSibling;
          if (prev) {
            prev.focus();
          }
        } else if (ev.keyCode === KEYS.RETURN) {
          this.selectRow(index, row);
        }
      }
    }, {
      key: 'rowClicked',
      value: function rowClicked(event, index, row) {
        if (!this.options.checkboxSelection) {
          // event.preventDefault();
          this.selectRow(event, index, row);
        }

        this.body.onRowClick({ row: row });
      }
    }, {
      key: 'rowDblClicked',
      value: function rowDblClicked(event, index, row) {
        if (!this.options.checkboxSelection) {
          event.preventDefault();
          this.selectRow(event, index, row);
        }
        if (this.options.treeToggleDblClick && this.hasTreeColumn) {
          this.$scope.$broadcast('rowDblClick', {
            row: row,
            index: index
          });
        }
        this.body.onRowDblClick({ row: row });
      }
    }, {
      key: 'onCheckboxChange',
      value: function onCheckboxChange(event, index, row) {
        this.selectRow(event, index, row);
      }
    }, {
      key: 'selectRow',
      value: function selectRow(event, index, row) {
        if (this.options.selectable) {
          if (this.options.multiSelect) {
            var isShiftKeyDown = event.shiftKey;

            if (isShiftKeyDown) {
              this.selectRowsBetween(index, row);
            } else {
              var idx = this.selected.indexOf(row);
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
    }, {
      key: 'selectRowsBetween',
      value: function selectRowsBetween(index) {
        var reverse = index < this.prevIndex;
        var selecteds = [];

        for (var i = 0, len = this.body.rows.length; i < len; i += 1) {
          var row = this.body.rows[i];
          var greater = i >= this.prevIndex && i <= index;
          var lesser = i <= this.prevIndex && i >= index;

          var range = {};
          if (reverse) {
            range = {
              start: index,
              end: this.prevIndex - index
            };
          } else {
            range = {
              start: this.prevIndex,
              end: index + 1
            };
          }

          if (reverse && lesser || !reverse && greater) {
            var idx = this.selected.indexOf(row);
            // if reverse shift selection (unselect) and the
            // row is already selected, remove it from selected
            if (reverse && idx > -1) {
              this.selected.splice(idx, 1);

              // if in the positive range to be added to `selected`, and
              // not already in the selected array, add it
            } else if (i >= range.start && i < range.end && idx === -1) {
              this.selected.push(row);
              selecteds.push(row);
            }
          }

          this.body.onSelect({ rows: selecteds });
        }
      }
    }]);

    return SelectionController;
  }();

  function SelectionDirective() {
    return {
      controller: SelectionController,
      restrict: 'A',
      require: '^dtBody',
      controllerAs: 'selCtrl'
    };
  }

  var RowController = function () {
    function RowController() {
      _classCallCheck(this, RowController);
    }

    _createClass(RowController, [{
      key: 'getValue',
      value: function getValue(col) {
        if (!col.prop) return '';
        return DeepValueGetter(this.row, col.prop);
      }
    }, {
      key: 'onTreeToggled',
      value: function onTreeToggled(cell) {
        this.onTreeToggle({
          cell: cell,
          row: this.row
        });
      }
    }, {
      key: 'stylesByGroup',
      value: function stylesByGroup(group) {
        var styles = {
          width: this.columnWidths[group] + 'px'
        };

        if (group === 'left') {
          TranslateXY(styles, this.options.internal.offsetX, 0);
        } else if (group === 'right') {
          var offset = (this.columnWidths.total - this.options.internal.innerWidth - this.options.internal.offsetX + this.options.internal.scrollBarWidth) * -1;
          TranslateXY(styles, offset, 0);
        }

        return styles;
      }
    }, {
      key: 'onCheckboxChanged',
      value: function onCheckboxChanged(ev) {
        this.onCheckboxChange({
          $event: ev,
          row: this.row
        });
      }
    }, {
      key: 'getChanges',
      value: function getChanges() {
        if (!this.row._original) return null;
        var result = {};
        for (var prop in this.row._original) {
          if (this.row._original.hasOwnProperty(prop)) {
            var value = this.row._original[prop];
            if (value !== this.row[prop]) result[prop] = this.row[prop];
          }
        }
        return Object.keys(result).length == 0 ? null : result;
      }
    }, {
      key: 'submitChanges',
      value: function submitChanges() {
        if (!this.row._original) return;
        var result = {};
        for (var prop in this.row._original) {
          if (this.row._original.hasOwnProperty(prop)) {
            this.row._original[prop] = this.row[prop];
          }
        }
      }
    }]);

    return RowController;
  }();

  function RowDirective() {
    return {
      restrict: 'E',
      controller: RowController,
      controllerAs: 'rowCtrl',
      scope: true,
      bindToController: {
        row: '=',
        columns: '=',
        columnWidths: '=',
        loading: '=',
        expanded: '=',
        selected: '=',
        isDraggable: '=',
        hasChildren: '=',
        options: '=',
        onCheckboxChange: '&',
        onTreeToggle: '&'
      },
      link: function link($scope, $elm, $attrs, ctrl) {
        if (ctrl.row) {
          // inital render position
          TranslateXY($elm[0].style, 0, ctrl.row.$$index * ctrl.options.rowHeight);
        }

        // register w/ the style translator
        ctrl.options.internal.styleTranslator.register($scope.$index, $elm);
      },

      template: '\n      <div class="dt-row" draggable={{rowCtrl.isDraggable}}>\n        <div class="dt-row-left dt-row-block"\n             ng-if="rowCtrl.columns[\'left\'].length"\n             ng-style="rowCtrl.stylesByGroup(\'left\')">\n          <dt-cell ng-repeat="column in rowCtrl.columns[\'left\'] track by column.$id"\n                   on-tree-toggle="rowCtrl.onTreeToggled(cell)"\n                   column="column"\n                   options="rowCtrl.options"\n                   has-children="rowCtrl.hasChildren"\n                   on-checkbox-change="rowCtrl.onCheckboxChanged($event)"\n                   selected="rowCtrl.selected"\n                   loading="rowCtrl.loading"\n                   row-ctrl="rowCtrl",\n                   expanded="rowCtrl.expanded"\n                   row="rowCtrl.row"\n                   value="rowCtrl.getValue(column)">\n          </dt-cell>\n        </div>\n        <div class="dt-row-center dt-row-block"\n             ng-style="rowCtrl.stylesByGroup(\'center\')">\n          <dt-cell ng-repeat="column in rowCtrl.columns[\'center\'] track by column.$id"\n                   on-tree-toggle="rowCtrl.onTreeToggled(cell)"\n                   column="column"\n                   options="rowCtrl.options"\n                   has-children="rowCtrl.hasChildren"\n                   loading="rowCtrl.loading"\n                   row-ctrl="rowCtrl",\n                   expanded="rowCtrl.expanded"\n                   selected="rowCtrl.selected"\n                   row="rowCtrl.row"\n                   on-checkbox-change="rowCtrl.onCheckboxChanged($event)"\n                   value="rowCtrl.getValue(column)">\n          </dt-cell>\n        </div>\n        <div class="dt-row-right dt-row-block"\n             ng-if="rowCtrl.columns[\'right\'].length"\n             ng-style="rowCtrl.stylesByGroup(\'right\')">\n          <dt-cell ng-repeat="column in rowCtrl.columns[\'right\'] track by column.$id"\n                   on-tree-toggle="rowCtrl.onTreeToggled(cell)"\n                   column="column"\n                   options="rowCtrl.options"\n                   has-children="rowCtrl.hasChildren"\n                   selected="rowCtrl.selected"\n                   on-checkbox-change="rowCtrl.onCheckboxChanged($event)"\n                   row="rowCtrl.row"\n                   loading="rowCtrl.loading"\n                   row-ctrl="rowCtrl",\n                   expanded="rowCtrl.expanded"\n                   value="rowCtrl.getValue(column)">\n          </dt-cell>\n        </div>\n      </div>',
      replace: true
    };
  }

  var GroupRowController = function () {
    function GroupRowController() {
      _classCallCheck(this, GroupRowController);
    }

    _createClass(GroupRowController, [{
      key: 'onGroupToggled',
      value: function onGroupToggled(evt) {
        evt.stopPropagation();
        this.onGroupToggle({
          group: this.row
        });
      }
    }, {
      key: 'treeClass',
      value: function treeClass() {
        return {
          'dt-tree-toggle': true,
          'icon-right': !this.expanded,
          'icon-down': this.expanded
        };
      }
    }]);

    return GroupRowController;
  }();

  function GroupRowDirective() {
    return {
      restrict: 'E',
      controller: GroupRowController,
      controllerAs: 'group',
      bindToController: {
        row: '=',
        onGroupToggle: '&',
        expanded: '=',
        options: '='
      },
      scope: true,
      replace: true,
      template: '\n      <div class="dt-group-row">\n        <span ng-class="group.treeClass()"\n              ng-click="group.onGroupToggled($event)">\n        </span>\n        <span class="dt-group-row-label" ng-bind="group.row.name">\n        </span>\n      </div>',
      link: function link($scope, $elm, $attrs, ctrl) {
        // inital render position
        TranslateXY($elm[0].style, 0, ctrl.row.$$index * ctrl.options.rowHeight);

        // register w/ the style translator
        ctrl.options.internal.styleTranslator.register($scope.$index, $elm);
      }
    };
  }

  var CellController = function () {
    /* @ngInject */
    CellController.$inject = ["$scope"];
    function CellController($scope) {
      _classCallCheck(this, CellController);

      _extends(this, {
        $scope: $scope
      });

      if (isOldAngular()) {
        this.$onInit();
      }
    }

    _createClass(CellController, [{
      key: '$onInit',
      value: function $onInit() {
        this.init();
      }
    }, {
      key: 'init',
      value: function init() {
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
    }, {
      key: 'styles',
      value: function styles() {
        return {
          width: this.column.width + 'px',
          'min-width': this.column.width + 'px'
        };
      }
    }, {
      key: 'cellClass',
      value: function cellClass() {
        var style = {
          'dt-tree-col': this.column.isTreeColumn
        };

        if (this.column.className) {
          style[this.column.className] = true;
        }

        return style;
      }
    }, {
      key: 'treeClass',
      value: function treeClass() {
        return {
          'dt-tree-toggle': true,
          'icon-right': !this.expanded,
          'icon-down': this.expanded,
          'icon-loading': this.loading //bgmd
        };
      }
    }, {
      key: 'onTreeToggled',
      value: function onTreeToggled(evt) {
        evt.stopPropagation();
        this.treeToggle();
      }
    }, {
      key: 'treeToggle',
      value: function treeToggle() {
        this.expanded = !this.expanded;
        this.onTreeToggle({
          cell: {
            value: this.value,
            column: this.column,
            expanded: this.expanded
          }
        });
      }
    }, {
      key: 'onCheckboxChanged',
      value: function onCheckboxChanged(event) {
        event.stopPropagation();
        this.onCheckboxChange({ $event: event });
      }
    }, {
      key: 'getValue',
      value: function getValue() {
        var val = this.column.cellDataGetter ? this.column.cellDataGetter(this.value) : this.value;

        if (angular.isUndefined(val) || val === null) {
          val = '';
        }

        return val;
      }
    }]);

    return CellController;
  }();

  function CellDirective($rootScope, $compile) {
    return {
      restrict: 'E',
      controller: CellController,
      scope: true,
      controllerAs: 'cell',
      bindToController: {
        options: '=',
        value: '=',
        selected: '=',
        column: '=',
        row: '=',
        expanded: '=',
        loading: '=',
        rowCtrl: '<',
        hasChildren: '=',
        onTreeToggle: '&',
        onCheckboxChange: '&'
      },
      template: '<div class="dt-cell"\n            data-title="{{::cell.column.name}}"\n            ng-style="cell.styles()"\n            ng-class="cell.cellClass()">\n        <label ng-if="cell.column.isCheckboxColumn" class="dt-checkbox">\n          <input type="checkbox"\n                 ng-checked="cell.selected"\n                 ng-click="cell.onCheckboxChanged($event)" />\n        </label>\n        <span ng-if="cell.column.isTreeColumn && cell.hasChildren"\n              ng-class="cell.treeClass()"\n              ng-click="cell.onTreeToggled($event)"></span>\n        <span class="dt-cell-content"></span>\n      </div>',
      replace: true,
      compile: function compile() {
        return {
          pre: function pre($scope, $elm, $attrs, ctrl) {
            var content = angular.element($elm[0].querySelector('.dt-cell-content'));

            var cellScope = void 0;

            // extend the outer scope onto our new cell scope
            if (ctrl.column.template || ctrl.column.cellRenderer || ctrl.column.editor) {
              createCellScope();
            }

            $scope.$watch('cell.row', function () {
              if (cellScope && cellScope.editing && ctrl.row._editing[ctrl.column.prop]) {
                return;
              }
              if (cellScope) {
                cellScope.getValue = ctrl.getValue;
                cellScope.$cell = ctrl.value;
                cellScope.$row = ctrl.row;
                cellScope.$column = ctrl.column;
                cellScope.editing = false;
                //a row was edited before scroll
                if (ctrl.row._editing) cellScope.editing = ctrl.row._editing[ctrl.column.prop];
                cellScope.editFilter = ctrl.options.editFilter;
                if (!cellScope.$rowCtrl) {
                  cellScope.$rowCtrl = {
                    rowChanges: ctrl.rowCtrl.getChanges.bind(ctrl.rowCtrl),
                    submitChanges: ctrl.rowCtrl.submitChanges.bind(ctrl.rowCtrl)
                  };
                }
              }
              if (ctrl.column.template || ctrl.column.cellRenderer || ctrl.column.editor) {
                if (ctrl._rendered) return;
                renderCell();
              } else content[0].innerHTML = ctrl.getValue();
              ctrl._rendered = true;
            }, !ctrl.options.readOnly);

            function createCellScope() {
              cellScope = ctrl.options.$outer.$new(false);
              cellScope.getValue = ctrl.getValue;
            }

            function renderCell() {
              var editorWrapper = null;
              var el = '<span>{{$cell}}</span>';
              if (ctrl.column.editor) {
                //for all rows
                var tag = ctrl.column.editor == 'textarea' ? 'textarea' : 'input';
                el = '{{$cell}}';
                editorWrapper = {};
                editorWrapper.begin = '<span ng-dblclick="edit($cell, $row, $column)" ng-show="!editing">';
                editorWrapper.end = '</span>\n                                    <div>\n                                      <' + tag + ' ng-show="editing" type="' + ctrl.column.editor + '" ng-model="$cell" ng-change="changed($cell, $row, $column)" \n                                             ng-blur="blur($row, $column)" style="width:100%;" focus-on="editing"/>\n                                    </div>';

                if (!ctrl.row._original) ctrl.row._original = {};
                ctrl.row._original[ctrl.column.prop] = ctrl.value;

                cellScope._changeEditStatus = function (row, column) {
                  this.editing = !this.editing;
                  if (!row._editing) row._editing = {};
                  row._editing[column.prop] = this.editing;
                };

                cellScope.edit = function (cellVal, row, column) {
                  //console.info('edit()', what, cellVal);
                  if (ctrl.row._noEdit || cellScope.editFilter && !cellScope.editFilter(row)) return;
                  cellScope._changeEditStatus(row, column);
                  //console.log('$id', this.$id, 'editing', this.editing);
                  return this.editing;
                };

                cellScope.blur = function (row, column) {
                  if (!this.editing) return;
                  this._changeEditStatus(row, column);
                };

                cellScope.changed = function (cellVal, row, col) {
                  //var idx = $scope.data.indexOf(row);
                  row[col.prop] = cellVal;
                  //$scope.data[idx] = row;
                };
              } // bgmd
              if (ctrl.column.template) {
                el = '' + ctrl.column.template.trim(); //bgmd
              } else if (ctrl.column.cellRenderer) {
                el = ctrl.column.cellRenderer(cellScope, content); //bgmd
              }
              if (editorWrapper) {
                el = editorWrapper.begin + el + editorWrapper.end;
              }
              var elm = angular.element(el);
              content.empty();
              content.append($compile(elm)(cellScope));
            }
          }
        };
      }
    };
  }

  function FocusOnDirective($timeout) {
    return {
      restrict: 'A',
      link: function link($scope, $element, $attr) {
        $scope.$watch($attr.focusOn, function (_focusVal) {
          $timeout(function () {
            _focusVal ? $element[0].focus() : $element[0].blur();
          });
        });
      }
    };
  }

  var FooterController = function () {
    /**
     * Creates an instance of the Footer Controller
     * @param  {scope}
     * @return {[type]}
     */

    /* @ngInject*/
    FooterController.$inject = ["$scope"];
    function FooterController($scope) {
      _classCallCheck(this, FooterController);

      _extends(this, {
        $scope: $scope
      });

      if (isOldAngular()) {
        this.$onInit();
      }
    }

    _createClass(FooterController, [{
      key: '$onInit',
      value: function $onInit() {
        this.init();
      }
    }, {
      key: 'init',
      value: function init() {
        var _this13 = this;

        this.page = this.paging.offset + 1;

        this.$scope.$watch('footer.paging.offset', function (newVal) {
          _this13.offsetChanged(newVal);
        });
      }
    }, {
      key: 'offsetChanged',
      value: function offsetChanged(newVal) {
        this.page = newVal + 1;
      }
    }, {
      key: 'onPaged',
      value: function onPaged(page) {
        this.paging.offset = page - 1;
        this.onPage({
          offset: this.paging.offset,
          size: this.paging.size
        });
      }
    }]);

    return FooterController;
  }();

  function FooterDirective() {
    return {
      restrict: 'E',
      controller: FooterController,
      controllerAs: 'footer',
      scope: true,
      bindToController: {
        paging: '=',
        onPage: '&'
      },
      template: '<div class="dt-footer">\n        <div class="page-count">{{footer.paging.count}} total</div>\n        <dt-pager page="footer.page"\n               size="footer.paging.size"\n               count="footer.paging.count"\n               on-page="footer.onPaged(page)"\n               ng-show="footer.paging.count / footer.paging.size > 1">\n         </dt-pager>\n      </div>',
      replace: true
    };
  }

  var PagerController = function () {
    /**
     * Creates an instance of the Pager Controller
     * @param  {object} $scope
     */

    /* @ngInject*/
    PagerController.$inject = ["$scope"];
    function PagerController($scope) {
      _classCallCheck(this, PagerController);

      _extends(this, {
        $scope: $scope
      });

      if (isOldAngular()) {
        this.$onInit();
      }
    }

    _createClass(PagerController, [{
      key: '$onInit',
      value: function $onInit() {
        this.init();
      }
    }, {
      key: 'init',
      value: function init() {
        var _this14 = this;

        this.$scope.$watch('pager.count', function () {
          _this14.findAndSetPages();
        });

        this.$scope.$watch('pager.size', function () {
          _this14.findAndSetPages();
        });

        this.$scope.$watch('pager.page', function (newVal) {
          if (newVal !== 0 && newVal <= _this14.totalPages) {
            _this14.getPages(newVal);
          }
        });

        if (this.size && this.count && this.page) {
          this.findAndSetPages();
        }
      }
    }, {
      key: 'findAndSetPages',
      value: function findAndSetPages() {
        this.calcTotalPages(this.size, this.count);
        this.getPages(this.page || 1);
      }
    }, {
      key: 'calcTotalPages',
      value: function calcTotalPages(size, count) {
        var localCount = size < 1 ? 1 : Math.ceil(count / size);

        this.totalPages = Math.max(localCount || 0, 1);
      }
    }, {
      key: 'selectPage',
      value: function selectPage(num) {
        if (num > 0 && num <= this.totalPages) {
          this.page = num;
          this.onPage({
            page: num
          });
        }
      }
    }, {
      key: 'prevPage',
      value: function prevPage() {
        if (this.canPrevious()) {
          this.selectPage(this.page -= 1);
        }
      }
    }, {
      key: 'nextPage',
      value: function nextPage() {
        if (this.canNext()) {
          this.selectPage(this.page += 1);
        }
      }
    }, {
      key: 'canPrevious',
      value: function canPrevious() {
        return this.page > 1;
      }
    }, {
      key: 'canNext',
      value: function canNext() {
        return this.page < this.totalPages;
      }
    }, {
      key: 'getPages',
      value: function getPages(page) {
        var pages = [];
        var maxSize = 5;
        var isMaxSized = maxSize < this.totalPages;

        var startPage = 1;
        var endPage = this.totalPages;

        if (isMaxSized) {
          startPage = (Math.ceil(page / maxSize) - 1) * maxSize + 1;
          endPage = Math.min(startPage + maxSize - 1, this.totalPages);
        }

        for (var number = startPage; number <= endPage; number += 1) {
          pages.push({
            number: number,
            text: number,
            active: number === page
          });
        }

        /*
        if (isMaxSized) {
          if (startPage > 1) {
            pages.unshift({
              number: startPage - 1,
              text: '...'
            });
          }
            if (endPage < this.totalPages) {
            pages.push({
              number: endPage + 1,
              text: '...'
            });
          }
        }
        */

        this.pages = pages;
      }
    }]);

    return PagerController;
  }();

  function PagerDirective() {
    return {
      restrict: 'E',
      controller: PagerController,
      controllerAs: 'pager',
      scope: true,
      bindToController: {
        page: '=',
        size: '=',
        count: '=',
        onPage: '&'
      },
      template: '<div class="dt-pager">\n        <ul class="pager">\n          <li ng-class="{ disabled: !pager.canPrevious() }">\n            <a href ng-click="pager.selectPage(1)" class="icon-prev"></a>\n          </li>\n          <li ng-class="{ disabled: !pager.canPrevious() }">\n            <a href ng-click="pager.prevPage()" class="icon-left"></a>\n          </li>\n          <li ng-repeat="pg in pager.pages track by $index" ng-class="{ active: pg.active }">\n            <a href ng-click="pager.selectPage(pg.number)">{{pg.text}}</a>\n          </li>\n          <li ng-class="{ disabled: !pager.canNext() }">\n            <a href ng-click="pager.nextPage()" class="icon-right"></a>\n          </li>\n          <li ng-class="{ disabled: !pager.canNext() }">\n            <a href ng-click="pager.selectPage(pager.totalPages)" class="icon-skip"></a>\n          </li>\n        </ul>\n      </div>',
      replace: true
    };
  }

  var POSITION = {
    LEFT: 'left',
    RIGHT: 'right',
    TOP: 'top',
    BOTTOM: 'bottom',
    CENTER: 'center',
    MIDDLE: 'middle'
  };

  /**
   * Popover Directive
   * @param {function} $animate
   * @param {function} $compile
   * @param {function} $document
   * @param {function} $http
   * @param {object} $q
   * @param {function} $templateCache
   * @param {function} $timeout
   * @param {function} PopoverRegistry
   * @param {function} PositionHelper
   */

  function PopoverDirective($animate, $compile, $document, $http, $q, $templateCache, $timeout, PopoverRegistry, PositionHelper) {
    /**
     * Loads a template from the template cache
     * @param  {string} template
     * @param  {boolean} plain
     * @return {object}  html template
     */
    function loadTemplate(template, plain) {
      if (!template) {
        return '';
      }

      if (angular.isString(template) && plain) {
        return template;
      }

      return $templateCache.get(template) || $http.get(template, { cache: true });
    }

    /**
     * Determines a boolean given a value
     * @param  {object} value
     * @return {boolean}
     */
    function toBoolean(value) {
      if (value && value.length !== 0) {
        var v = value.toString().toLowerCase();
        value = v === 'true';
      } else {
        value = false;
      }

      return value;
    }

    return {
      restrict: 'A',
      scope: true,
      replace: false,
      link: function link($scope, $element, $attributes) {
        $scope.popover = null;

        $scope.options = {
          alignment: $attributes.popoverAlignment || 'middle',
          placement: $attributes.popoverPlacement || 'right',
          plain: toBoolean($attributes.popoverPlain || false),
          popoverId: $attributes.popoverId,
          showCaret: toBoolean($attributes.popoverPlain || false),
          spacing: parseInt($attributes.popoverSpacing, 10) || 0,
          template: $attributes.popoverTemplate,
          text: $attributes.popoverText
        };

        $scope.$on('$destroy', function () {
          $element.off();
        });

        // attach mouse events to element
        $element.on('mouseenter', display);
        $element.on('mouseleave', beginTimeout);
        $element.on('mousemove', cancelTimeout);

        /**
         * Begin a timeout of 500ms before hiding popover
         */
        function beginTimeout() {
          $scope.exitTimeout = $timeout(remove, 500);
        }

        /**
         * Cancel the timeout to keep popover visible
         */
        function cancelTimeout() {
          $timeout.cancel($scope.exitTimeout);
        }

        /**
         * Displays the popover on the page
         */
        function display() {
          if ($scope.$parent.$column && $scope.$parent.$column.width - 5 >= $element.width()) {
            //Text has not overflowed
            return;
          }
          // Cancel exit timeout
          cancelTimeout();
          //refresh popover text
          $scope.options.text = $attributes.popoverText;

          var elm = $document[0].getElementById($scope.options.popoverId);
          if ($scope.popover && elm) return;

          if ($scope.options.text && !$scope.options.template) {
            displayTextPopover();
          } else {
            displayTemplatePopover();
          }
        }

        /**
         * When using template, load and compile the template prior to appending popover
         */
        function displayTemplatePopover() {
          $q.when(loadTemplate($scope.options.template, $scope.options.plain)).then(function (template) {
            if (!angular.isString(template)) {
              if (template.data && angular.isString(template.data)) {
                template = template.data;
              } else {
                template = '';
              }
            }

            buildElement('template');

            $scope.popover.html(template);
            $compile($scope.popover)($scope);
            angular.element($document.body).append($scope.popover);
            positionPopover($element, $scope.popover, $scope.options);

            managePopover();
          });
        }

        /**
         * With text only, simply build up the popover and append it to body
         */
        function displayTextPopover() {
          buildElement('text');

          $scope.popover.html($scope.options.text);
          angular.element($document[0].body).append($scope.popover);

          managePopover();
        }

        function buildElement(type) {
          $scope.popover = angular.element('<div\n          class="dt-popover popover' + $scope.options.placement + '"\n          id="' + $scope.options.popoverId + '"></div>');

          if (type === 'text') {
            $scope.popover.addClass('popover-text');
          }
        }

        /**
         * Position popover, bind handlers, and register popover
         */
        function managePopover() {
          positionPopover($element, $scope.popover, $scope.options);

          // attach mouse events to popover
          $scope.popover.on('mouseleave', beginTimeout);
          $scope.popover.on('mousemove', cancelTimeout);

          PopoverRegistry.add($scope.options.popoverId, {
            element: $element,
            popover: $scope.popover
          });
        }

        /**
         * Removes the template from the registry and page
         */
        function remove() {
          if ($scope.popover) {
            $scope.popover.off();
            $scope.popover.remove();
          }

          $scope.popover = null;
          PopoverRegistry.remove($scope.options.popoverId);
        }

        /**
         * Positions the popover
         * @param  {object} triggerElement
         * @param  {object} popover
         * @param  {object} options
         */
        function positionPopover(triggerElement, popover, options) {
          $timeout(function () {
            var elDimensions = triggerElement[0].getBoundingClientRect();
            var popoverDimensions = popover[0].getBoundingClientRect();

            var top = void 0;
            var left = void 0;

            if (options.placement === POSITION.RIGHT) {
              left = elDimensions.left + elDimensions.width + options.spacing;
              top = calculateVerticalAlignment();
            } else if (options.placement === POSITION.LEFT) {
              left = elDimensions.left - popoverDimensions.width - options.spacing;
              top = calculateVerticalAlignment();
            } else if (options.placement === POSITION.TOP) {
              top = elDimensions.top - popoverDimensions.height - options.spacing;
              left = calculateHorizontalAlignment();
            } else if (options.placement === POSITION.BOTTOM) {
              top = elDimensions.top + elDimensions.height + options.spacing;
              left = calculateHorizontalAlignment();
            }

            function calculateVerticalAlignment() {
              return PositionHelper.calculateVerticalAlignment(elDimensions, popoverDimensions, options.alignment);
            }

            function calculateHorizontalAlignment() {
              return PositionHelper.calculateHorizontalAlignment(elDimensions, popoverDimensions, options.alignment);
            }

            popover.css({
              top: top + 'px',
              left: left + 'px',
              height: popoverDimensions.height, //'300px',
              'overflow-x': 'hidden'
            });

            if ($scope.options.showCaret) {
              addCaret($scope.popover, elDimensions, popoverDimensions);
            }

            $animate.addClass($scope.popover, 'popover-animation');
          }, 50);
        }

        /**
         * Adds a caret and positions it relatively to the popover
         * @param {object} popoverEl
         * @param {object} elDimensions
         * @param {object} popoverDimensions
         */
        function addCaret(popoverEl, elDimensions, popoverDimensions) {
          var caret = angular.element('<span class="popover-caret caret-' + $scope.options.placement + '"></span>');
          popoverEl.append(caret);
          var caretDimensions = caret[0].getBoundingClientRect();

          var left = void 0;
          var top = void 0;

          if ($scope.options.placement === POSITION.RIGHT) {
            left = -6;
            top = calculateVerticalCaret();
          } else if ($scope.options.placement === POSITION.LEFT) {
            left = popoverDimensions.width - 2;
            top = calculateVerticalCaret();
          } else if ($scope.options.placement === POSITION.TOP) {
            top = popoverDimensions.height - 5;
            left = calculateHorizontalCaret();
          } else if ($scope.options.placement === POSITION.BOTTOM) {
            top = -8;
            left = calculateHorizontalCaret();
          }

          function calculateVerticalCaret() {
            return PositionHelper.calculateVerticalCaret(elDimensions, popoverDimensions, caretDimensions, $scope.options.alignment);
          }

          function calculateHorizontalCaret() {
            return PositionHelper.calculateHorizontalCaret(elDimensions, popoverDimensions, caretDimensions, $scope.options.alignment);
          }

          caret.css({
            top: top + 'px',
            left: left + 'px'
          });
        }
      }
    };
  }

  function PopoverRegistry() {
    var popovers = {};

    return {
      add: function add(id, object) {
        popovers[id] = object;
        return popovers[id];
      },
      find: function find(id) {
        return popovers[id];
      },
      remove: function remove(id) {
        delete popovers[id];
      }
    };
  }

  /**
   * Position helper for the popover directive.
   */

  /* eslint-disable angular/log */

  /* @ngInject */
  function PositionHelper($log) {
    function subtractAll(items) {
      var total = 0;

      items.forEach(function (count, index) {
        total = index === 0 ? total += count : total -= count;
      });

      return total;
    }

    return {
      calculateHorizontalAlignment: function calculateHorizontalAlignment(elDimensions, popoverDimensions, alignment) {
        switch (alignment) {
          case POSITION.LEFT:
            return elDimensions.left;
          case POSITION.RIGHT:
            return elDimensions.left + (elDimensions.width - popoverDimensions.width);
          case POSITION.CENTER:
            return elDimensions.left + (elDimensions.width / 2 - popoverDimensions.width / 2);
          default:
            return $log.warn('calculateHorizontalAlignment issue', this);
        }
      },
      calculateVerticalAlignment: function calculateVerticalAlignment(elDimensions, popoverDimensions, alignment) {
        switch (alignment) {
          case POSITION.TOP:
            return elDimensions.top;
          case POSITION.BOTTOM:
            return elDimensions.top + (elDimensions.height - popoverDimensions.height);
          case POSITION.MIDDLE:
            return elDimensions.top + (elDimensions.height / 2 - popoverDimensions.height / 2);
          default:
            return $log.warn('calculateVerticalAlignment issue', this);
        }
      },
      calculateVerticalCaret: function calculateVerticalCaret(elDimensions, popoverDimensions, caretDimensions, alignment) {
        switch (alignment) {
          case POSITION.TOP:
            return subtractAll([elDimensions.height / 2, caretDimensions.height / 2, 1]);
          case POSITION.BOTTOM:
            return subtractAll([popoverDimensions.height, elDimensions.height / 2, caretDimensions.height / 2, 1]);
          case POSITION.MIDDLE:
            return subtractAll([popoverDimensions.height / 2, caretDimensions.height / 2, 1]);
          default:
            return $log.warn('calculateVerticalCaret issue', this);
        }
      },
      calculateHorizontalCaret: function calculateHorizontalCaret(elDimensions, popoverDimensions, caretDimensions, alignment) {
        switch (alignment) {
          case POSITION.LEFT:
            return subtractAll([elDimensions.width / 2, caretDimensions.height / 2, 1]);
          case POSITION.RIGHT:
            return subtractAll([popoverDimensions.width, elDimensions.width / 2, caretDimensions.height / 2, 1]);
          case POSITION.CENTER:
            return subtractAll([popoverDimensions.width / 2, caretDimensions.height / 2, 1]);
          default:
            return $log.warn('calculateHorizontalCaret issue', this);
        }
      }
    };
  }

  var popover = angular.module('dt.popover', []).factory('PopoverRegistry', PopoverRegistry).factory('PositionHelper', PositionHelper).directive('popover', PopoverDirective);

  var MenuController = function () {

    /* @ngInject */
    MenuController.$inject = ["$scope"];
    function MenuController($scope) {
      _classCallCheck(this, MenuController);

      this.$scope = $scope;
    }

    _createClass(MenuController, [{
      key: 'getColumnIndex',
      value: function getColumnIndex(model) {
        return this.$scope.current.findIndex(function (col) {
          return model.name === col.name;
        });
      }
    }, {
      key: 'isChecked',
      value: function isChecked(model) {
        return this.getColumnIndex(model) > -1;
      }
    }, {
      key: 'onCheck',
      value: function onCheck(model) {
        var idx = this.getColumnIndex(model);
        if (idx === -1) {
          this.$scope.current.push(model);
        } else {
          this.$scope.current.splice(idx, 1);
        }
      }
    }]);

    return MenuController;
  }();

  function MenuDirective() {
    return {
      restrict: 'E',
      controller: 'MenuController',
      controllerAs: 'dtm',
      scope: {
        current: '=',
        available: '='
      },
      template: '<div class="dt-menu dropdown" close-on-click="false">\n        <a href="#" class="dropdown-toggle icon-add">\n          Configure Columns\n        </a>\n        <div class="dropdown-menu" role="menu" aria-labelledby="dropdown">\n          <div class="keywords">\n            <input type="text"\n                   click-select\n                   placeholder="Filter columns..."\n                   ng-model="columnKeyword"\n                   autofocus />\n          </div>\n          <ul>\n            <li ng-repeat="column in available | filter:columnKeyword">\n              <label class="dt-checkbox">\n                <input type="checkbox"\n                       ng-checked="dtm.isChecked(column)"\n                       ng-click="dtm.onCheck(column)">\n                {{column.name}}\n              </label>\n            </li>\n          </ul>\n        </div>\n      </div>'
    };
  }

  var DropdownController = function () {
    /* @ngInject*/
    DropdownController.$inject = ["$scope"];
    function DropdownController($scope) {
      _classCallCheck(this, DropdownController);

      _extends(this, {
        $scope: $scope
      });

      $scope.open = false;
    }

    _createClass(DropdownController, [{
      key: 'toggle',
      value: function toggle() {
        this.$scope.open = !this.$scope.open;
      }
    }]);

    return DropdownController;
  }();

  function DropdownDirective($document, $timeout) {
    return {
      restrict: 'C',
      controller: 'DropdownController',
      link: function link($scope, $elm) {
        function closeDropdown(ev) {
          if ($elm[0].contains(ev.target)) {
            return;
          }

          $timeout(function () {
            $scope.open = false;
            off();
          });
        }

        function keydown(ev) {
          if (ev.which === 27) {
            $timeout(function () {
              $scope.open = false;
              off();
            });
          }
        }

        function off() {
          $document.unbind('click', closeDropdown);
          $document.unbind('keydown', keydown);
        }

        $scope.$watch('open', function (newVal) {
          if (newVal) {
            $document.bind('click', closeDropdown);
            $document.bind('keydown', keydown);
          }
        });
      }
    };
  }

  function DropdownToggleDirective($timeout) {
    return {
      restrict: 'C',
      controller: 'DropdownController',
      require: '?^dropdown',
      link: function link($scope, $elm, $attrs, ctrl) {
        function toggleClick(event) {
          event.preventDefault();
          $timeout(function () {
            ctrl.toggle();
          });
        }

        function toggleDestroy() {
          $elm.unbind('click', toggleClick);
        }

        $elm.bind('click', toggleClick);
        $scope.$on('$destroy', toggleDestroy);
      }
    };
  }

  function DropdownMenuDirective($animate) {
    return {
      restrict: 'C',
      require: '?^dropdown',
      link: function link($scope, $elm) {
        $scope.$watch('open', function () {
          $animate[$scope.open ? 'addClass' : 'removeClass']($elm, 'ddm-open');
        });
      }
    };
  }

  var dropdown = angular.module('dt.dropdown', []).controller('DropdownController', DropdownController).directive('dropdown', DropdownDirective).directive('dropdownToggle', DropdownToggleDirective).directive('dropdownMenu', DropdownMenuDirective);

  var menu = angular.module('dt.menu', [dropdown.name]).controller('MenuController', MenuController).directive('dtm', MenuDirective);

  var dataTable = angular.module('data-table', []).directive('dtable', DataTableDirective).directive('resizable', ResizableDirective).directive('sortable', SortableDirective).directive('draggableRow', DraggableRowDirective).directive('dtHeader', HeaderDirective).directive('dtHeaderCell', HeaderCellDirective).directive('dtBody', BodyDirective).directive('dtScroller', ScrollerDirective).directive('dtSelection', SelectionDirective).directive('dtRow', RowDirective).directive('dtGroupRow', GroupRowDirective).directive('dtCell', CellDirective).directive('dtFooter', FooterDirective).directive('dtPager', PagerDirective).directive('focusOn', FocusOnDirective);

  exports.dtPopover = popover;
  exports.dtMenu = menu;
  exports.default = dataTable;
});