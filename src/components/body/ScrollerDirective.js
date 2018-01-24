import { requestAnimFrame } from '../../utils/utils';
import StyleTranslator from './StyleTranslator';
// import { debounce } from '../../utils/throttle';
// import { throttle } from '../../utils/throttle';

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
      let lastPercentScroll = 0;
      let _updated = false;

      ctrl.options.internal.styleTranslator =
        new StyleTranslator(ctrl.options.rowHeight);

      ctrl.options.internal.setYOffset = (offsetY) => {
        parent[0].scrollTop = offsetY;
      };

      function update() {
        if (!ctrl.options.rowFixedHeight) {
          _updated = true;
        }
        ctrl.options.internal.offsetY = lastScrollY;
        ctrl.options.internal.offsetX = lastScrollX;
        ctrl.options.internal.percentScroll = lastPercentScroll;

        ctrl.updatePage();

        if (ctrl.options.scrollbarV) {
          ctrl.getRows(true);
        }

        ctrl.options.$outer.$digest();
        //setTimeout(() => $scope.$digest());

        ticking = false;
        if (!ctrl.options.rowFixedHeight) {
          setTimeout(() => {
            _updated = false;
          }, 300);
        }
      }

      function requestTick() {
        if (!ticking) {
          requestAnimFrame(update);
          ticking = true;
        }
      }

      function onScroll() {
        //console.log('onScroll');
        if (!ctrl.options.rowFixedHeight && _updated) {
          console.log('onScroll not _updated');
          return;
        }
        if (ctrl._hackToAvoidUnwantedScroll_) {
          this.scrollTop = lastScrollY;
          this.scrollLeft = lastScrollX;
          this.percentScroll = lastPercentScroll;
          ctrl._hackToAvoidUnwantedScroll_ = undefined;
        }
        lastScrollY = this.scrollTop;
        lastScrollX = this.scrollLeft;
        lastPercentScroll = (this.scrollTop * 100) / this.scrollHeight;
        requestTick();
      }

      parent.on('scroll', onScroll);//throttle(onScroll.bind(parent[0]), 1000));

      $scope.$on('$destroy', () => {
        parent.off('scroll');
      });

      $scope.scrollerStyles = () => {
        if (!ctrl.options.rowFixedHeight) {
          return {
            height: '100%',
          };
        } else if (ctrl.options.scrollbarV) {
          return {
            height: `${ctrl.count * ctrl.options.rowHeight}px`,
          };
        }

        return undefined;
      };
    },
  };
}
