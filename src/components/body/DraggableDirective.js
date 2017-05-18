/**
 * Draggable row Directive
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
        if (!elem)
          return null;  
        var el = elem;
        do {
          if (el.hasAttribute && el.hasAttribute('draggable')) {
            return el;
          }
        }
        while (el = el.parentNode);
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
        if (e.dataTransfer)
          e.dataTransfer.dropEffect = 'move'; 
        return false;
      }

      function onDragEnd(evt) {
        evt.preventDefault();
        dragEl.classList.remove('dt-clone');

        $element.off('dragend', onDragEnd);
        $element.off('dragover', onDragOver);
        $element.off('dragenter', onDragEnter);

        var elem = document.elementFromPoint(evt.clientX, evt.clientY);
        if (!isDescendant($element[0], elem))
          toEl = null;  
        const target = findParentDraggable(toEl);
        const indexFrom = +dragEl.getAttribute('rowindex');
        const indexTo = target ? +target.getAttribute('rowindex') : -1;
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

      $scope.$on('$destroy', () => {
        $element.off('dragstart', onDragStart);
      });
    }
  };
}
