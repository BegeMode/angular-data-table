import CellController from './CellController';

export default function CellDirective($rootScope, $compile) {
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
      onCheckboxChange: '&',
    },
    template:
    `<div class="dt-cell"
            data-title="{{::cell.column.name}}"
            ng-style="cell.styles()"
            ng-class="cell.cellClass()">
        <label ng-if="cell.column.isCheckboxColumn" class="dt-checkbox">
          <input type="checkbox"
                 ng-checked="cell.selected"
                 ng-click="cell.onCheckboxChanged($event)" />
        </label>
        <span ng-if="cell.column.isTreeColumn && cell.hasChildren"
              ng-class="cell.treeClass()"
              ng-click="cell.onTreeToggled($event)"></span>
        <span class="dt-cell-content"></span>
      </div>`,
    replace: true,
    compile() {
      return {
        pre($scope, $elm, $attrs, ctrl) {
          const content = angular.element($elm[0].querySelector('.dt-cell-content'));

          let cellScope;

          // extend the outer scope onto our new cell scope
          if (ctrl.column.template || ctrl.column.cellRenderer || ctrl.column.editor) {
            createCellScope();
          }

          $scope.$watch('cell.row', () => {
            if (cellScope) {
              //cellScope.$destroy(); bgmd
              //createCellScope(); bgmd
              cellScope.getValue = ctrl.getValue;
              cellScope.$cell = ctrl.value;
              cellScope.$row = ctrl.row;
              cellScope.$column = ctrl.column;
              //cellScope.$$watchers = null; bgmd
              if (!cellScope.$rowCtrl) {
                cellScope.$rowCtrl = {
                  rowChanges: ctrl.rowCtrl.getChanges.bind(ctrl.rowCtrl),
                  submitChanges: ctrl.rowCtrl.submitChanges.bind(ctrl.rowCtrl),
                }
              }
            }
            //bgmd
            if (ctrl.column.template || ctrl.column.cellRenderer || ctrl.column.editor) {
              if (ctrl._rendered)
                return;
              renderCell();
            }
            else
              content[0].innerHTML = ctrl.getValue();
            ctrl._rendered = true;
          }, false);

          function createCellScope() {
            cellScope = ctrl.options.$outer.$new(false);
            cellScope.getValue = ctrl.getValue;
          }

          function renderCell() {
            let editorWrapper = null;
            if (ctrl.column.editor) {
              let tag = ctrl.column.editor == 'textarea' ? 'textarea' : 'input';
              editorWrapper = {};
              editorWrapper.begin = `<div ng-dblclick="edit($cell, $row)" ng-show="!editing">`;
              editorWrapper.end = `</div>
                                    <div>
                                      <${tag} ng-show="editing" type="${ctrl.column.editor}" ng-model="$cell" ng-change="changed($cell, $row, $column)" 
                                             ng-blur="edit($cell, $row)" style="width:100%;" focus-on="editing"/>
                                    </div>`;

              if (!ctrl.row._original)
                ctrl.row._original = {};
              ctrl.row._original[ctrl.column.prop] = ctrl.value;

              cellScope.edit = function (cellVal, row) {
                this.editing = !this.editing;
                return this.editing;
              };
              cellScope.changed = function (cellVal, row, col) {
                //var idx = $scope.data.indexOf(row);
                row[col.prop] = cellVal;
                //$scope.data[idx] = row;
              };

            }// bgmd
            let el = '<span>{{$cell}}</span>'; //bgmd
            if (ctrl.column.template) {
              el = `<span>${ctrl.column.template.trim()}</span>`; //bgmd
            }
            else if (ctrl.column.cellRenderer) {
              el = ctrl.column.cellRenderer(cellScope, content); //bgmd
            }

            if (editorWrapper) {
              el = editorWrapper.begin + el + editorWrapper.end;
            }
            const elm = angular.element(el);
            content.empty();
            content.append($compile(elm)(cellScope));

          }
        },
      }
    },
  }
}
