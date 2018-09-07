angular.module('image.basics')

.controller('ResizeController', ['$scope', '$rootScope', 'canvas', 'history', function($scope, $rootScope, canvas, history) {

    $scope.constrainProportions = true;

    $scope.percent = 100;

    $scope.startResizer = function($event) {

        $scope.width = canvas.fabric.getWidth();
        $scope.height = canvas.fabric.getHeight();
        history.add('beforeResize', false, true);
        $scope.originalDataUrl = canvas.fabric.toDataURL();

        $scope.openPanel('resize', $event);
    };

    $scope.apply = function() {
        $rootScope.activePanel = false;
        $scope.percent = 100;
        history.add('resize', 'crop-free')
    };

    $scope.cancel = function() {
        history.load('beforeResize');
        $rootScope.activePanel = false;
        canvas.fabric.calcOffset();
    };

    $scope.resizeByPercent = function(percent) {
        var height = (percent / 100) * $scope.height;
        var width = (percent / 100) * $scope.width;

        canvas.fabric.clear();
        canvas.resetZoom();
        canvas.loadMainImage($scope.originalDataUrl, height, width, true);
    };

    $scope.resize = function(newHeight, newWidth) {

        if ($scope.constrainProportions) {
            var wRatio = canvas.fabric.getWidth() / newWidth;
            var hRatio = canvas.fabric.getHeight() / newHeight;

            if (wRatio !== 1) {
                $scope.height = canvas.fabric.getHeight() / wRatio;
            }

            else {
                $scope.width = canvas.fabric.getWidth() / hRatio;
            }
        }

        canvas.fabric.clear();
        canvas.loadMainImage($scope.originalDataUrl, $scope.height, $scope.width, true);
    };
}]);