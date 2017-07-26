import RowController from './RowController';
import TranslateXY from '../../utils/translate';

export default function RowDirective() {
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
      onTreeToggle: '&',
    },
    link($scope, $elm, $attrs, ctrl) {
      if (ctrl.row) {
        // inital render position
        TranslateXY($elm[0].style, 0, ctrl.row.$$index * ctrl.options.rowHeight);
      }

      // register w/ the style translator
      ctrl.options.internal.styleTranslator.register($scope.$index, $elm);
    }, 
    template: `
      <div class="dt-row" draggable={{rowCtrl.isDraggable}}>
        <div class="dt-row-left dt-row-block"
             ng-if="rowCtrl.columns['left'].length"
             ng-style="rowCtrl.stylesByGroup('left')">
          <dt-cell ng-repeat="column in rowCtrl.columns['left'] track by column.$id" dt-suspendable
                   on-tree-toggle="rowCtrl.onTreeToggled(cell)"
                   column="column"
                   options="rowCtrl.options"
                   has-children="rowCtrl.hasChildren"
                   on-checkbox-change="rowCtrl.onCheckboxChanged($event)"
                   selected="rowCtrl.selected"
                   loading="rowCtrl.loading"
                   row-ctrl="rowCtrl",
                   expanded="rowCtrl.expanded"
                   row="rowCtrl.row"
                   value="rowCtrl.getValue(column)">
          </dt-cell>
        </div>
        <div class="dt-row-center dt-row-block"
             ng-style="rowCtrl.stylesByGroup('center')">
          <dt-cell ng-repeat="column in rowCtrl.columns['center'] track by column.$id" dt-suspendable
                   on-tree-toggle="rowCtrl.onTreeToggled(cell)"
                   column="column"
                   options="rowCtrl.options"
                   has-children="rowCtrl.hasChildren"
                   loading="rowCtrl.loading"
                   row-ctrl="rowCtrl",
                   expanded="rowCtrl.expanded"
                   selected="rowCtrl.selected"
                   row="rowCtrl.row"
                   on-checkbox-change="rowCtrl.onCheckboxChanged($event)"
                   value="rowCtrl.getValue(column)">
          </dt-cell>
        </div>
        <div class="dt-row-right dt-row-block"
             ng-if="rowCtrl.columns['right'].length"
             ng-style="rowCtrl.stylesByGroup('right')">
          <dt-cell ng-repeat="column in rowCtrl.columns['right'] track by column.$id" dt-suspendable
                   on-tree-toggle="rowCtrl.onTreeToggled(cell)"
                   column="column"
                   options="rowCtrl.options"
                   has-children="rowCtrl.hasChildren"
                   selected="rowCtrl.selected"
                   on-checkbox-change="rowCtrl.onCheckboxChanged($event)"
                   row="rowCtrl.row"
                   loading="rowCtrl.loading"
                   row-ctrl="rowCtrl",
                   expanded="rowCtrl.expanded"
                   value="rowCtrl.getValue(column)">
          </dt-cell>
        </div>
      </div>`,
    replace: true,
  };
}
