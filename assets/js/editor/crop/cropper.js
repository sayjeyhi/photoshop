angular.module('image.crop', [])

.service('cropper', ['$rootScope', 'cropzone', 'canvas', 'history', function($rootScope, cropzone, canvas, history) {
	
	var cropper = {

		start: function(e) {
			cropzone.add();
			$rootScope.openPanel('crop', e);
		},

		stop: function(e) {
			cropzone.remove();
			$rootScope.activePanel = false;
		},

		crop: function() {
			if ( ! cropzone.initiated) return false;

			cropzone.hide();
		    var image = new Image();

		    image.onload = function() {
		        var fabricImage = new fabric.Image(this, canvas.imageStatic);

		        canvas.mainImage.remove();
		        canvas.fabric.setWidth(cropzone.rect.getWidth());
		        canvas.fabric.setHeight(cropzone.rect.getHeight());

        		canvas.fabric.add(fabricImage);
        		canvas.mainImage = fabricImage;
        		cropzone.remove();

                history.add('crop', 'crop');

				$rootScope.$apply(function() {
					$rootScope.activePanel = false;
				});
		    };

			if (canvas.zoom !== 100) {
				canvas.resetZoom();
			}

		    image.src = canvas.fabric.toDataURL({
		        left: cropzone.rect.getLeft(),
		        top: cropzone.rect.getTop(),
		        width: cropzone.rect.getWidth(),
		        height: cropzone.rect.getHeight()
		    });

            canvas.original.width = cropzone.rect.getWidth();
            canvas.original.height = cropzone.rect.getHeight();
		}

	};

	return cropper;

}]);