'use strict';

export default function SuspendableDirective() {
  return {
    restrict: 'A',
    link: function (scope) {
      var watchers;

      scope.$on('suspend', function () {
        watchers = scope.$$watchers;
        scope.$$watchers = [];
      });

      scope.$on('resume', function () {
        if (watchers)
          scope.$$watchers = watchers;
        watchers = void 0;
      });
    }
  };
};