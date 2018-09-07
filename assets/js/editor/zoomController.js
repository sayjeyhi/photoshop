'use strict';

angular.module('ImageEditor')

.controller('ZoomController', ['$rootScope', '$scope', 'canvas', function($rootScope, $scope, canvas) {

        $scope.canvas = canvas;
        $scope.zoom = 1;
        $scope.oldZoom = 1;
        $scope.maxScale = 200;
        $scope.minScale = 30;

        $rootScope.$on('editor.mainImage.loaded', function() { $scope.fitToScreen() });
        $rootScope.$on('canvas.openedNew', function() { $scope.fitToScreen() });

        $scope.fitToScreen = function () {
            $scope.zoom = canvas.currentScale * 100;

            if (canvas.mainImage) {
                var oWidth = canvas.mainImage.originalState.width,
                    oHeight = canvas.mainImage.originalState.height;
            } else {
                var oWidth = canvas.fabric.getWidth(),
                    oHeight = canvas.fabric.getHeight();
            }

            var maxScale = Math.min(3582 / oHeight, 5731 / oWidth) * 100,
                minScale = Math.min(141 / oHeight, 211 / oWidth) * 100;

            $scope.maxScale = Math.ceil(maxScale);
            $scope.minScale = Math.ceil(minScale);
        };

        //make sure we adjust zoom slider properly on history change
        $rootScope.$on('history.loaded', function() {
            $scope.zoom = canvas.currentScale * 100;
        });

        $scope.doZoom = function () {
            if ($scope.zoom > $scope.oldZoom) {
                canvas.scaleUp(($scope.zoom / 100) / canvas.currentScale);
            } else {
                canvas.scaleDown(canvas.currentScale / ($scope.zoom / 100));
            }

            $scope.oldZoom = $scope.zoom;
        };

        $scope.getCurrentZoom = function() {
            return Math.round(canvas.currentScale * 100);
        };
}]);



