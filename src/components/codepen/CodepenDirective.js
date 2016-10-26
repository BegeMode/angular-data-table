(function(){
  "use strict";

  angular.module('pages')
   .directive('codepen', ['$sce',
      CodepenDirective
   ]);

  function CodepenDirective($sce) {
    return {
      restrict: 'AE',
      templateUrl: './src/components/codepen/codepen.html',
      scope: {
        codepenId: '='
      },
      link: function($scope, el, attributes){
        $scope.render = function(){
          $scope.codepenUrl = $sce.trustAsResourceUrl('//codepen.io/properjon/embed/' + $scope.codepenId +  '/?height=600&theme-id=0&default-tab=result');
        }

        $scope.render();

        $scope.$watch('codepenId', function(){
          $scope.render();
        });
      }
    };
  }

})();
