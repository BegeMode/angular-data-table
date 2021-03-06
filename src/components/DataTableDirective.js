import DataTableController from './DataTableController';
import { ScrollbarWidth, ObjectId } from '../utils/utils';
import { throttle } from '../utils/throttle';
import DataTableService from './DataTableService';

export default function DataTableDirective($window, $timeout, $parse) {
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
      onFiltered: '&',
      onTreeToggle: '&',
      onPage: '&',
      onRowClick: '&',
      onRowDblClick: '&',
      onColumnResize: '&',
      onTreeLoader: '&',
      onMoveRow: '&'
    },
    controllerAs: 'dt',
    template(element) {
      // Gets the column nodes to transposes to column objects
      // http://stackoverflow.com/questions/30845397/angular-expressive-directive-design/30847609#30847609
      const columns = element[0].getElementsByTagName('column');
      const id = ObjectId();

      DataTableService.saveColumns(id, columns);

      return `<div class="dt" ng-class="dt.tableCss()" ng-style="dt.tableStyles()" data-column-id="${id}">
          <dt-header options="dt.options"
                     columns="dt.columnsByPin"
                     column-widths="dt.columnWidths"
                     ng-if="dt.options.headerHeight"
                     on-resize="dt.onResized(column, width)"
                     selected-rows="dt.selected"
                     all-rows="dt.rows"
                     on-sort="dt.onSorted()">
          </dt-header>
          <dt-body rows="dt.rows"
                   selected="dt.selected"
                   expanded="dt.expanded"
                   columns="dt.columnsByPin"
                   on-select="dt.onSelected(rows)"
                   on-row-click="dt.onRowClicked(row)"
                   on-row-dbl-click="dt.onRowDblClicked(row)"
                   column-widths="dt.columnWidths"
                   options="dt.options"
                   on-page="dt.onBodyPage(offset, size)"
                   on-tree-toggle="dt.onTreeToggled(row, cell)"
                   on-tree-loader="dt.onTreeLoad(row, cell)"   
                   on-rows-filtered="dt.onRowsFiltered(rows)"   
                   on-move-row="dt.moveRow(rowFrom, rowTo)">   
          </dt-body>
          <dt-footer ng-if="dt.options.footerHeight || dt.options.paging.mode"
                     ng-style="{ height: dt.options.footerHeight + 'px' }"
                     on-page="dt.onFooterPage(offset, size)"
                     paging="dt.options.paging" total-text="dt.options.totalString">
           </dt-footer>
        </div>`;
    },
    compile() {
      return {
        pre($scope, $elm, $attrs, ctrl) {
          DataTableService.buildColumns($scope, $parse);

          // Check and see if we had expressive columns
          // and if so, lets use those
          const id = $elm.attr('data-column-id');
          const columns = DataTableService.columns[id];

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
            const rect = $elm[0].getBoundingClientRect();

            ctrl.options.internal.innerWidth = Math.floor(rect.width);

            if (ctrl.options.scrollbarV) {
              let height = rect.height;

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
            throttle(() => {
              $timeout(resize);
            });
          }

          $window.addEventListener('resize', calculateResize);

          // When an item is hidden for example
          // in a tab with display none, the height
          // is not calculated correrctly.  We need to watch
          // the visible attribute and resize if this occurs
          const checkVisibility = () => {
            const bounds = $elm[0].getBoundingClientRect();
            const visible = bounds.width && bounds.height;

            if (visible) {
              resize();
              $timeout(checkSize, 500);
            } else {
              $timeout(checkVisibility, 100);
            }
          };

          const checkSize = () => {
            const dtBody = $elm.find('dt-body');
            if ($elm[0].offsetHeight - dtBody[0].offsetHeight > 100) {
              resize();
            }
          };

          checkVisibility();

          // add a loaded class to avoid flickering
          $elm.addClass('dt-loaded');

          // prevent memory leaks
          $scope.$on('$destroy', () => {
            angular.element($window).off('resize');
          });
        },
      };
    },
  };
}
