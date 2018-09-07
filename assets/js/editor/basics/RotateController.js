angular.module('image.basics', [])

.controller('RotateController', ['$scope', '$rootScope', 'canvas', 'history', function($scope, $rootScope, canvas, history) {

        $scope.angle = 0;

        $scope.startRotator = function($event) {
            history.add('rotate-original-state', 'backup', true);
            $scope.openPanel('rotate', $event);
        };

        $scope.applyRotation = function() {
            $rootScope.activePanel = false;
            history.add('rotation', 'rotate-right');
        };

        $scope.cancel = function() {
            history.load('rotate-original-state');
            $rootScope.activePanel = false;
            $scope.angle = 0;
        };

        $scope.rotateLeft = function() {
            $scope.rotate(90, 'left');
        };

        $scope.rotateRight = function() {
            $scope.rotate(90, 'right');
        };

        $scope.rotate = function(angle, direction) {

            canvas.fabric.forEachObject(function(obj) {

                if (direction && direction === 'left') {
                    angle = obj.getAngle() - 90;
                } else if (direction && direction === 'right') {
                    angle = obj.getAngle() + 90;
                }

                if ((obj.originX !== 'center' || obj.originY !== 'center') && obj.centeredRotation) {
                    $scope.setOriginToCenter && $scope.setOriginToCenter(obj);
                    resetOrigin = true;
                }

                angle = angle > 360 ? 90 : angle < 0 ? 270 : angle;

                obj.setAngle(angle).setCoords();

                if (resetOrigin) {
                    $scope.setCenterToOrigin && $scope.setCenterToOrigin(obj);
                }
            });

            canvas.fitToScreen();
            canvas.fabric.renderAll();
        };

        $scope.setOriginToCenter = function (obj) {
            obj._originalOriginX = obj.originX;
            obj._originalOriginY = obj.originY;

            var center = obj.getCenterPoint();

            obj.set({
                originX: 'center',
                originY: 'center',
                left: center.x,
                top: center.y
            });
        };

        $scope.setCenterToOrigin = function (obj) {
            var originPoint = obj.translateToOriginPoint(
                obj.getCenterPoint(),
                obj._originalOriginX,
                obj._originalOriginY);

            obj.set({
                originX: obj._originalOriginX,
                originY: obj._originalOriginY,
                left: originPoint.x,
                top: originPoint.y
            });
        };
}]);