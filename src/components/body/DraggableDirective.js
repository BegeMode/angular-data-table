/**
 * Sortable Directive
 * http://jsfiddle.net/RubaXa/zLq5J/3/
 * https://jsfiddle.net/hrohxze0/6/
 * @param {function}
 */
export default function DraggableRowDirective() {
  return {
    restrict: 'A',
    scope: {
      isDraggable: '=draggableRow',
      onDrop: '&',
    },
    link($scope, $element) {
      let dragEl;
      let nextEl;
      let toEl;

      function findParentDraggable(elem) {
        var el = elem;
        do {
          if (el.hasAttribute('draggable')) {
            return el;
          }
        }
        while (el = el.parentNode);
        return null;
      }

      function isbefore(a, b) {
        if (a.parentNode === b.parentNode) {
          for (let cur = a; cur; cur = cur.previousSibling) {
            if (cur === b) {
              return true;
            }
          }
        }
        return false;
      }

      function onDragEnter(e) {
        toEl = e.target;
      }

      function onDragEnd(evt) {
        evt.preventDefault();

        dragEl.classList.remove('dt-clone');

        $element.off('dragend', onDragEnd);
        $element.off('dragenter', onDragEnter);

        const target = findParentDraggable(toEl);
        if (target !== dragEl) {
          $scope.onDrop({
            event: evt,
            row: dragEl,
            rowTo: target
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
        $element.on('dragend', onDragEnd);
      }

      $element.on('dragstart', onDragStart);

      $scope.$on('$destroy', () => {
        $element.off('dragstart', onDragStart);
      });
    },
  };
}
