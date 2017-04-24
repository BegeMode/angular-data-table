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
              if (ctrl.row._editing)
                cellScope.editing = ctrl.row._editing[ctrl.column.prop]; 
              cellScope.editFilter = ctrl.options.editFilter;
              if (!cellScope.$rowCtrl) {
                cellScope.$rowCtrl = {
                  rowChanges: ctrl.rowCtrl.getChanges.bind(ctrl.rowCtrl),
                  submitChanges: ctrl.rowCtrl.submitChanges.bind(ctrl.rowCtrl),
                };
              }
            }
            if (ctrl.column.template || ctrl.column.cellRenderer || ctrl.column.editor) {
              if (ctrl._rendered)
                return;
              renderCell();
            }
            else
              content[0].innerHTML = ctrl.getValue();
            ctrl._rendered = true;
          }, !ctrl.options.readOnly);

          function createCellScope() {
            cellScope = ctrl.options.$outer.$new(false);
            cellScope.getValue = ctrl.getValue;
          }

          function renderCell() {
            let editorWrapper = null;
            let el = '<span>{{$cell}}</span>';  
            if (ctrl.column.editor) {
              //for all rows
              let tag = ctrl.column.editor == 'textarea' ? 'textarea' : 'input';
              el = '{{$cell}}'; 
              editorWrapper = {};
              editorWrapper.begin = `<span ng-dblclick="edit($cell, $row, $column)" ng-show="!editing">`;
              editorWrapper.end = `</span>
                                    <div>
                                      <${tag} ng-show="editing" type="${ctrl.column.editor}" ng-model="$cell" ng-change="changed($cell, $row, $column)" 
                                             ng-blur="blur($row, $column)" style="width:100%;" focus-on="editing"/>
                                    </div>`;

              if (!ctrl.row._original)
                ctrl.row._original = {};
              ctrl.row._original[ctrl.column.prop] = ctrl.value;

              cellScope._changeEditStatus = function(row, column) {
                this.editing = !this.editing;
                if (!row._editing)
                  row._editing = {};  
                row._editing[column.prop] = this.editing;
              };

              cellScope.edit = function(cellVal, row, column) {
                //console.info('edit()', what, cellVal);
                if (ctrl.row._noEdit || (cellScope.editFilter && !cellScope.editFilter(row)))
                  return;  
                cellScope._changeEditStatus(row, column);
                //console.log('$id', this.$id, 'editing', this.editing);
                return this.editing;
              };
              
              cellScope.blur = function(row, column) {
                if (!this.editing)
                  return;  
                this._changeEditStatus(row, column);
              };
              
              cellScope.changed = function(cellVal, row, col) {
                //var idx = $scope.data.indexOf(row);
                row[col.prop] = cellVal;
                //$scope.data[idx] = row;
              };
            }// bgmd
            if (ctrl.column.template) {
              el = `${ctrl.column.template.trim()}`; //bgmd
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