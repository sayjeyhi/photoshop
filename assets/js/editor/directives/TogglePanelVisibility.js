angular.module('image.directives')

.directive('edTogglePanelVisibility', function() {
    return {
        restrict: 'A',
        compile: function(el, attrs) {
            el.on('click', function() {
                el.find('.mdi').toggleClass('toggled');

                $('#'+attrs.edTogglePanelVisibility).find('ul').mCustomScrollbar('disable').slideToggle(150, function() {
                    $(this).mCustomScrollbar('update');
                });
            });
        }
   	}
});