angular.module('ImageEditor')

.service('canvas', ['$rootScope', '$mdDialog', function($rootScope, $mdDialog) {

	var canvas = {

        original: {},

		mainImage: false,
		fabric: false,
		ctx: false,
		container: false,
		viewport: false,
		offset: false,
		element: false,

        minWidth: 50,
        minHeight: 50,

		imageStatic: {
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
		},

		scaleFactor: 1.01, //(~1%)
		currentScale: 1,

		start: function() {
			this.element = document.getElementById('canvas');
			this.fabric = new fabric.Canvas('canvas');
			this.ctx = this.fabric.getContext('2d');
			this.container = $('.canvas-container');
			this.viewport = document.getElementById('viewport');

            this.fabric.selection = false;
			this.fabric.renderOnAddRemove = false;

            fabric.Object.prototype.borderColor = '#2196F3';
            fabric.Object.prototype.cornerColor = '#2196F3';
            fabric.Object.prototype.transparentCorners = false;

            if ( ! $rootScope.started) {
                $mdDialog.show({
                    template: $('#main-image-upload-dialog-template').html(),
                    controller: 'TopPanelController',
                    clickOutsideToClose: false,
                });
            }
        },

        mergeObjects: function() {
            this.fabric.deactivateAll();
            var data = this.fabric.toDataURL();
            this.fabric.clear();
            this.loadMainImage(data);
        },

        openNew: function(width, height) {
            width = width < this.minWidth ? this.minWidth : width;
            height = height < this.minHeight ? this.minHeight : height;

            this.fabric.clear();
            this.fabric.setWidth(width);
            this.fabric.setHeight(height);
            this.fabric.renderAll();
        },

        serialize: function() {
            return this.fabric.toJSON(['selectable', 'name']);
        },

		fitToScreen: function () {
			var maxWidth = canvas.viewport.offsetWidth - 40;
			var maxHeight = canvas.viewport.offsetHeight - 120;

			if (canvas.mainImage.getHeight() > maxHeight || canvas.mainImage.getWidth() > maxWidth) {
				var scale = Math.min(maxHeight / canvas.mainImage.getHeight(), maxWidth / canvas.mainImage.getWidth());
				canvas.scaleDown(1 / scale);
			}
		},

		loadMainImage: function(url, height, width, dontFit, callback) {
			var object;
			fabric.util.loadImage(url, function (img) {

			    object = new fabric.Image(img, canvas.imageStatic);
			    object.name = 'mainImage';

                if (width && height) {
                    object.width = width;
                    object.height = height;
                }

			    canvas.mainImage = object;

                canvas.fabric.forEachObject(function(obj) {
                    if (obj.name == 'mainImage') {
                        canvas.fabric.remove(obj);
                    }
                });
			    canvas.fabric.add(object);
			    object.moveTo(0);

			    canvas.fabric.setHeight(object.height);
			    canvas.fabric.setWidth(object.width);

                canvas.original.height = object.height;
                canvas.original.width = object.width;

				if ( ! dontFit) {
                    canvas.fitToScreen();
                }

				$rootScope.$apply(function() {
					$rootScope.$emit('editor.mainImage.loaded');
				});

                if (callback) {
                    callback();
                }
			});
		},

        setZoom: function(factor) {
            canvas.fabric.setZoom(scaleFactor);
            canvas.fabric.setHeight(canvas.original.height * scaleFactor);
            canvas.fabric.setWidth(canvas.original.width * scaleFactor);
        },

		scaleUp: function(scaleFactor) {

            if ( ! scaleFactor) {
				scaleFactor = this.scaleFactor;
            }

		    this.currentScale = (this.currentScale * scaleFactor).toFixed(2);

		    this.fabric.setHeight(this.fabric.getHeight() * scaleFactor);
		    this.fabric.setWidth(this.fabric.getWidth() * scaleFactor);

		    var objects = this.fabric.getObjects();
		    for (var i in objects) {
		        var scaleX = objects[i].scaleX;
		        var scaleY = objects[i].scaleY;
		        var left = objects[i].left;
		        var top = objects[i].top;

		        var tempScaleX = scaleX * scaleFactor;
		        var tempScaleY = scaleY * scaleFactor;
		        var tempLeft = left * scaleFactor;
		        var tempTop = top * scaleFactor;

		        objects[i].scaleX = tempScaleX;
		        objects[i].scaleY = tempScaleY;
		        objects[i].left = tempLeft;
		        objects[i].top = tempTop;

		        objects[i].setCoords();
		    }

		    this.fabric.renderAll();
		},

		scaleDown: function(scaleFactor) {

            if ( ! scaleFactor) {
				scaleFactor = this.scaleFactor;
            }

		    this.currentScale = (this.currentScale / scaleFactor).toFixed(2);

		    this.fabric.setHeight(this.fabric.getHeight() * (1 / scaleFactor));
		    this.fabric.setWidth(this.fabric.getWidth() * (1 / scaleFactor));

		    var objects = this.fabric.getObjects();
		    for (var i in objects) {
		        var scaleX = objects[i].scaleX;
		        var scaleY = objects[i].scaleY;
		        var left = objects[i].left;
		        var top = objects[i].top;

		        var tempScaleX = scaleX * (1 / scaleFactor);
		        var tempScaleY = scaleY * (1 / scaleFactor);
		        var tempLeft = left * (1 / scaleFactor);
		        var tempTop = top * (1 / scaleFactor);

		        objects[i].scaleX = tempScaleX;
		        objects[i].scaleY = tempScaleY;
		        objects[i].left = tempLeft;
		        objects[i].top = tempTop;

		        objects[i].setCoords();
		    }

		    this.fabric.renderAll();
		},

		resetScaleToOriginal: function() {
		    this.fabric.setHeight(this.fabric.getHeight() * (1 / this.currentScale));
		    this.fabric.setWidth(this.fabric.getWidth() * (1 / this.currentScale));

		    var objects = this.fabric.getObjects();
		    for (var i in objects) {
		        var scaleX = objects[i].scaleX;
		        var scaleY = objects[i].scaleY;
		        var left = objects[i].left;
		        var top = objects[i].top;

		        var tempScaleX = scaleX * (1 / this.currentScale);
		        var tempScaleY = scaleY * (1 / this.currentScale);
		        var tempLeft = left * (1 / this.currentScale);
		        var tempTop = top * (1 / this.currentScale);

		        objects[i].scaleX = tempScaleX;
		        objects[i].scaleY = tempScaleY;
		        objects[i].left = tempLeft;
		        objects[i].top = tempTop;

		        objects[i].setCoords();
		    }

		    this.fabric.renderAll();
		    this.currentScale = 1;
		},

	};

	return canvas;

}])