angular.module('ImageEditor')

.controller('ObjectsPanelController', ['$scope', '$rootScope', 'canvas', function($scope, $rootScope, canvas) {
	$scope.objects = canvas.fabric._objects || [];

    $scope.setAsActive = function(object) {
        if (object) {
            canvas.fabric.setActiveObject(object);
        }
    };

    $scope.toggleVisibility = function(object) {
        if ( ! object) return;

        if (object.visible) {
            object.set({ visible: false, evented: false, selectable: false, hasBorders: false, hasCorners: false });
        } else {
            object.set({ visible: true, evented: true, selectable: true, hasBorders: true, hasCorners: true });
            canvas.fabric.setActiveObject(object);
        }

        canvas.fabric.renderAll();
    };

    $scope.deleteObject = function(object) {
        if (object) {
            canvas.fabric.remove(object);
            canvas.fabric.renderAll();
        }
    };

    $scope.toggleLock = function(object) {
        if ( ! object) return;

        if (object.locked) {
            object.set({
                locked: false,
                selectable: true,
                evented: true,
                lockMovementX: false,
                lockMovementY: false,
                lockRotation: false,
                lockScalingX: false,
                lockScalingY: false,
                lockUniScaling: false,
                hasControls: true,
                hasBorders: true
            });

            canvas.fabric.setActiveObject(object);
        } else {
            object.set({
                locked: true,
                selectable: false,
                evented: false,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                lockUniScaling: true,
                hasControls: false,
                hasBorders: false
            });
        }

        canvas.fabric.renderAll();
    }
}]);