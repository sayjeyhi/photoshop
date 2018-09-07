angular.module('image.directives')

.directive('edPrettyScrollbar', function() {
    return {
        restrict: 'A',
        compile: function(el, attrs) {
            setTimeout(function() {
                el.mCustomScrollbar({
                    theme: attrs.edScrollTheme || 'inset',
                    scrollInertia: 300,
                    autoExpandScrollbar: false,
                    axis: attrs.edScrollAxis || 'x',
                    advanced: { autoExpandHorizontalScroll:true },
                });
            }, 1)
        }
   	}
});