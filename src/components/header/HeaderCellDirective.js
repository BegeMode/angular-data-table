import HeaderCellController from './HeaderCellController';

export default function HeaderCellDirective($compile) {
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
      selected: '=',
    },
    replace: true,
    template:
      `<div ng-class="hcell.cellClass()"
            class="dt-header-cell"
            draggable="true"
            data-id="{{column.$id}}"
            ng-style="hcell.styles()"
            style="height:100%;"
            title="{{::hcell.column.name}}">
        <div resizable="hcell.column.resizable"
             on-resize="hcell.onResized(width, hcell.column)"
             min-width="hcell.column.minWidth"
             max-width="hcell.column.maxWidth">
          <label ng-if="hcell.column.isCheckboxColumn && hcell.column.headerCheckbox" class="dt-checkbox">
            <input type="checkbox"
                   ng-model="hcell.column.allRowsSelected"
                   ng-change="hcell.checkboxChangeCallback()" />
          </label>
          <span class="dt-header-cell-label"
                ng-click="hcell.onSorted($event)">
          </span>
          <span ng-class="hcell.sortClass()">{{hcell.column.sortPriority}}</span>
          <div ng-if="hcell.column.filter">
            <input type="{{hcell.column.filter}}" ng-model-options="{ debounce: 500 }" placeholder="Filter {{hcell.column.name}}" ng-click="hcell.onFilterClick($event)" ng-model="hcell.column.filterKeywords" style="width:99%;"/>
          </div>
        </div>
      </div>`,
    compile() {
      return {
        pre($scope, $elm, $attrs, ctrl) {
          const label = $elm[0].querySelector('.dt-header-cell-label');

          let cellScope;

          if (ctrl.column.headerTemplate || ctrl.column.headerRenderer || ctrl.column.headerFilterTemplate) {
            cellScope = ctrl.options.$outer.$new(false);

            // copy some props
            cellScope.$header = ctrl.column.name;
            cellScope.$index = $scope.$index;
          }

          if (ctrl.column.headerTemplate) {
            let el = `<span>${ctrl.column.headerTemplate.trim()}</span>`;
            //if (ctrl.column.headerFilterTemplate)
            //  el += '<br>' + ctrl.column.headerFilterTemplate;  
            const elm = angular.element(el);
            angular.element(label).append($compile(elm)(cellScope));
          } else if (ctrl.column.headerRenderer) {
            let el = ctrl.column.headerRenderer($elm);
            //if (ctrl.column.headerFilterTemplate)
            //  el += '<br>' + ctrl.column.headerFilterTemplate;  
            const elm = angular.element(el);
            angular.element(label).append($compile(elm)(cellScope)[0]);
          } else {
            let val = ctrl.column.name;
            if (angular.isUndefined(val) || val === null) val = '';
            /*if (ctrl.column.headerFilterTemplate) {
              let el = `<span>${val}</span><br>` + ctrl.column.headerFilterTemplate;
              const elm = angular.element(el);
              angular.element(label).append($compile(elm)(cellScope));
            }
            else*/
              label.textContent = val;
          }
        },
      };
    },
  };
}
