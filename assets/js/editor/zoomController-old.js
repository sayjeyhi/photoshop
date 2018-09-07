'use strict';

angular.module('ImageEditor')

.controller('ZoomController', ['$rootScope', '$scope', 'canvas', function($rootScope, $scope, canvas) {

        $scope.canvas = canvas;
        $scope.maxScale = 200;
        $scope.minScale = 30;

        $rootScope.$on('editor.mainImage.loaded', function () {
            var oWidth = canvas.mainImage.originalState.width,
                oHeight = canvas.mainImage.originalState.height,
                maxScale = Math.min(3582 / oHeight, 5731 / oWidth) * 100,
                minScale = Math.min(141 / canvas.mainImage.originalState.height, 211 / canvas.mainImage.originalState.width) * 100;

            $scope.maxScale = Math.ceil(maxScale);
            $scope.minScale = Math.ceil(minScale);
        });

        $scope.doZoom = function () {
            canvas.setZoom(canvas.zoom / 100);
        };

        $scope.getCurrentZoom = function() {
            return Math.round(canvas.zoom);
        };
}]);



