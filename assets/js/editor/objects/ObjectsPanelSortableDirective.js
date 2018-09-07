angular.module('ImageEditor')

.directive('edObjectsPanelSortable', ['$rootScope', 'canvas', function ($rootScope, canvas) {
    return {
        link: function ($scope, el) {
            var oldIndex, newIndex, obj;

            el.sortable({
                items: '.object:visible',
                scroll: false,
                containment: 'parent',
                start: function(e, ui) {
                    oldIndex = $(ui.item).index();
                },
                update: function(e, ui) {
                    newIndex = $(ui.item).index();

                    obj = canvas.fabric.getObjects()[oldIndex];

                    if ( ! obj) return;

                    if (newIndex > oldIndex) {
                        //send object forwards by the amount of objects it passed
                        for (var i = 0; i < (newIndex - oldIndex); i++) {
                            canvas.fabric.bringForward(obj);
                        }
                    } else {
                        //send object backwards by the amount of objects it passed
                        for (var i = 0; i < (oldIndex - newIndex); i++) {
                            canvas.fabric.sendBackwards(obj);
                        }
                    }

                    $rootScope.$apply(function() {
                        canvas.fabric.renderAll();
                        oldIndex = false;
                    });
                }
            })
        }
    };
}]);
