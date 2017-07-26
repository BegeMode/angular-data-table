import { requestAnimFrame } from '../../utils/utils';
import StyleTranslator from './StyleTranslator';
//import { debounce } from '../../utils/throttle';

export default function ScrollerDirective() {
  return {
    restrict: 'E',
    require: '^dtBody',
    transclude: true,
    replace: true,
    template: '<div ng-style="scrollerStyles()" ng-transclude></div>',
    link($scope, $elm, $attrs, ctrl) {
      const parent = $elm.parent();

      let ticking = false;
      let lastScrollY = 0;
      let lastScrollX = 0;

      ctrl.options.internal.styleTranslator =
        new StyleTranslator(ctrl.options.rowHeight);

      ctrl.options.internal.setYOffset = (offsetY) => {
        parent[0].scrollTop = offsetY;
      };

      /*const digest = debounce(() => {
        console.log('digest');
        ctrl.options.$outer.$digest();
      }, 10, false);*/

      function update() {
        ctrl.options.internal.offsetY = lastScrollY;
        ctrl.options.internal.offsetX = lastScrollX;
        ctrl.updatePage();

        if (ctrl.options.scrollbarV) {
          ctrl.getRows(true);
        }

        ctrl.options.$outer.$digest();
        //digest();

        ticking = false;
      }

      function requestTick() {
        if (!ticking) {
          requestAnimFrame(update);
          ticking = true;
        }
      }

      const onScroll = (e) => { 
        //console.log('scroll');
        const self = e.target;
        if (ctrl._hackToAvoidUnwantedScroll_) {
          self.scrollTop = lastScrollY;
          self.scrollLeft = lastScrollX;
          ctrl._hackToAvoidUnwantedScroll_ = void 0;
          return;
        }
        lastScrollY = self.scrollTop;
        lastScrollX = self.scrollLeft;
        $scope.$broadcast('suspend');
        requestTick();
        $scope.$broadcast('resume');
      };
        

      parent.on('scroll', onScroll);

      $scope.$on('$destroy', () => {
        parent.off('scroll');
      });

      $scope.scrollerStyles = () => {
        if (ctrl.options.scrollbarV) {
          return {
            height: `${ctrl.tempRows.length * ctrl.options.rowHeight}px`,
          };
        }

        return undefined;
      };
    },
  };
}
