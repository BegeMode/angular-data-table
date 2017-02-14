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
            if (cellScope && cellScope._initialized) //bgmd
              return;
            if (cellScope) {
              /*var editing = cellScope.editing; //bgmd
              cellScope.$destroy();

              createCellScope();

              cellScope.editing = editing; //bgmd
              */
              cellScope._initialized = true;
              cellScope.$cell = ctrl.value;
              cellScope.$row = ctrl.row;
              cellScope.$column = ctrl.column;
              cellScope.$$watchers = null;
            }
            //bgmd
            let editorWrapper = null;
            let el = '<span>{{$cell}}</span>'; //bgmd
            if (ctrl.column.editor) {
              editorWrapper = {};
              editorWrapper.begin = `<div ng-dblclick="editing = true" ng-show="!editing">`;
              editorWrapper.end =  `</div>
                                    <div>
                                      <input ng-show="editing" type="text" ng-model="$cell" ng-change="changed($cell, $row, $column)" ng-blur="editing = false" style="width:100%;"/>
                                    </div>`;
              cellScope.changed = function (cellVal, row, col) {
                //var idx = $scope.data.indexOf(row);
                row[col.prop] = cellVal;
                //$scope.data[idx] = row;
              };

            }// bgmd
            if (ctrl.column.template) {
              content.empty();
              el = `<span>${ctrl.column.template.trim()}</span>`; //bgmd
              if (editorWrapper) {
                el = editorWrapper.begin + el + editorWrapper.end;
              }
              const elm = angular.element(el);
              content.append($compile(elm)(cellScope));
            } else if (ctrl.column.cellRenderer) {
              content.empty();
              el = ctrl.column.cellRenderer(cellScope, content); //bgmd
              if (editorWrapper) {
                el = editorWrapper.begin + el + editorWrapper.end;
              }
              const elm = angular.element(el);
              content.append($compile(elm)(cellScope));
            } else {
              if (editorWrapper) {
                el = editorWrapper.begin + el + editorWrapper.end;
                const elm = angular.element(el);
                content.append($compile(elm)(cellScope));
              }
              else
                content[0].innerHTML = ctrl.getValue();
            }
          }, false);

          function createCellScope() {
            cellScope = ctrl.options.$outer.$new(false);
            cellScope.getValue = ctrl.getValue;
          }
        },
      };
    },
  };
}
