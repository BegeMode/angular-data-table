import BodyController from './BodyController';

export default function BodyDirective() {
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
    template: `
      <div dt-suspendable
        class="progress-linear"
        role="progressbar"
        ng-show="body.options.loadingIndicator">
        <div class="container">
          <div class="bar"></div>
        </div>
      </div>
      <div class="dt-body" ng-style="body.styles()" dt-selection dt-suspendable 
               draggable-row="body.options.rowDraggable"
               on-drop="body.onDropRow(event, indexFrom, indexTo)">
        <dt-scroller class="dt-body-scroller" dt-suspendable>
          <dt-group-row ng-repeat-start="r in body.tempRows track by $index"
                        ng-if="r.group"
                        ng-style="body.groupRowStyles(r)"
                        options="body.options"
                        on-group-toggle="body.onGroupToggle(group)"
                        expanded="body.getRowExpanded(r)"
                        loading="body.getRowLoading(r)"
                        tabindex="{{$index}}"
                        row="r">
          </dt-group-row>
          <dt-row ng-repeat-end dt-suspendable
                  ng-if="!r.group"
                  row="body.getRowValue($index)"
                  tabindex="{{$index}}"
                  rowindex="{{r.$$index}}"
                  columns="body.columns"
                  column-widths="body.columnWidths"
                  ng-keydown="selCtrl.keyDown($event, $index, r)"
                  ng-click="selCtrl.rowClicked($event, r.$$index, r)"
                  ng-dblclick="selCtrl.rowDblClicked($event, r.$$index, r)"
                  on-tree-toggle="body.onTreeToggled(row, cell)"
                  ng-class="body.rowClasses(r)"
                  options="body.options"
                  selected="body.isSelected(r)"
                  on-checkbox-change="selCtrl.onCheckboxChange($event, $index, row)"
                  columns="body.columnsByPin"
                  has-children="body.getRowHasChildren(r)"
                  expanded="body.getRowExpanded(r)"
                  loading="body.getRowLoading(r)"
                  ng-style="body.rowStyles(r)"
                  is-draggable="body.isDraggable(r)">
          </dt-row>
        </dt-scroller>
        <div ng-if="body.rows && !body.rows.length" dt-suspendable
             class="empty-row"
             ng-bind="::body.options.emptyMessage">
       </div>
       <div ng-if="body.rows === undefined" dt-suspendable
             class="loading-row"
             ng-bind="::body.options.loadingMessage">
        </div>
      </div>`,
  };
}
