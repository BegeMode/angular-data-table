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
      // selected: '=',
      column: '=',
      row: '=',
      expanded: '=',
      loading: '=',
      rowCtrl: '<',
      hasChildren: '=',
      onTreeToggle: '&',
      onCheckboxChange: '&',
      checked: '=',
    },
    template:
      `<div class="dt-cell"
            data-title="{{::cell.column.name}}"
            ng-style="cell.styles()"
            ng-class="cell.cellClass()">
        <label ng-if="cell.column.isCheckboxColumn" class="dt-checkbox">
          <input type="checkbox"
                 ng-checked="cell.checked"
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
            if (cellScope && cellScope.editing && ctrl.row._editing && ctrl.row._editing[ctrl.column.prop]) {
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
              if (!ctrl._rendered) {
                renderCell();
              }
            } else {
              content[0].innerHTML = ctrl.getValue();
            }
            ctrl._rendered = true;
            if (ctrl.column.cellRenderer) {
              ctrl.column.cellRenderer(cellScope, content[0]);
            }
          }, !ctrl.options.readOnly);

          function createCellScope() {
            cellScope = ctrl.options.$outer.$new(false);
            cellScope.getValue = ctrl.getValue;
          }

          function renderCell() {
            let editorWrapper = null;
            let el = null;
            if (ctrl.column.editor) {
              // for all rows
              const tag = ctrl.column.editor == 'textarea' ? 'textarea' : 'input';
              el = '{{$cell}}';
              editorWrapper = {};
              editorWrapper.begin = `<span ng-dblclick="edit($cell, $row, $column)" ng-show="!editing">`;
              editorWrapper.end = `</span>
                                    <div>
                                      <${tag} ng-show="editing" type="${ctrl.column.editor}" ng-model="$cell" ng-change="changed($cell, $row, $column)" 
                                             ng-blur="blur($row, $column)" style="width:100%;" focus-on="editing"/>
                                    </div>`;

              if (!ctrl.row._original) {
                ctrl.row._original = {};
              }
              ctrl.row._original[ctrl.column.prop] = ctrl.value;

              cellScope._changeEditStatus = (row, column) => {
                this.editing = !this.editing;
                if (!row._editing) {
                  row._editing = {};
                }
                row._editing[column.prop] = this.editing;
              };

              cellScope.edit = (cellVal, row, column) => {
                // console.info('edit()', what, cellVal);
                if (ctrl.row._noEdit || (cellScope.editFilter && !cellScope.editFilter(row))) {
                  return;
                }
                cellScope._changeEditStatus(row, column);
                // console.log('$id', this.$id, 'editing', this.editing);
                return this.editing;
              };
              
              cellScope.blur = (row, column) => {
                if (!this.editing) {
                  return;
                }
                this._changeEditStatus(row, column);
              };
              
              cellScope.changed = (cellVal, row, col) => {
                row[col.prop] = cellVal;
              };
            }
            if (ctrl.column.template) {
              const tmpl = ctrl.column.template(cellScope, content[0]);
              el = tmpl ? `${tmpl.trim()}` : '<span>{{$cell}}</span>';
            }
            if (editorWrapper) {
              el = editorWrapper.begin + el + editorWrapper.end;
            }
            if (el) {
              const elm = angular.element(el);
              content.empty();
              content.append($compile(elm)(cellScope));
            }
          }
        },
      };
    },
  };
}
