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

        zoom: 100,

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

		start: function(url) {
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

            if (url) {
                this.loadMainImage(url);
                $rootScope.started = true;
            }

            if ( ! $rootScope.started && ! $rootScope.isIntegrationMode()) {
                $mdDialog.show({
                    template: $('#main-image-upload-dialog-template').html(),
                    controller: 'TopPanelController',
                    clickOutsideToClose: false,
                });
            }
        },

        hideModals: function() {
            $mdDialog.hide();
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

            canvas.fitToScreen();

            $rootScope.$emit('canvas.openedNew');
        },

        center: function(obj) {
            obj.center();

            if (canvas.zoom > 100) {
                obj.setLeft(10);
                obj.setTop(35);
            }

            obj.setCoords();
        },

        serialize: function() {
            return this.fabric.toJSON(['selectable', 'name']);
        },

		loadMainImage: function(url, height, width, dontFit, callback) {
			var object;

			fabric.util.loadImage(url, function (img) {
                img.crossOrigin = 'anonymous';

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
                window.canv = canvas;
                if (callback) {
                    callback();
                }
			});
		},

        //zoooming

        currentScale: 1,
        scaleFactor: 1.01, //(~1%)

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

        fitToScreen: function () {
            var maxWidth = canvas.viewport.offsetWidth - 40,
                maxHeight = canvas.viewport.offsetHeight - 120,
                outter    = canvas.mainImage || canvas.fabric;

            if (outter.getHeight() > maxHeight || outter.getWidth() > maxWidth) {
                var scale = Math.min(maxHeight / outter.getHeight(), maxWidth / outter.getWidth());
                canvas.scaleDown(1 / scale);
            }
        },

        resetZoom: function() {
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
        }

        //fitToScreen: function () {
        //    var maxWidth = canvas.viewport.offsetWidth - 40;
        //    var maxHeight = canvas.viewport.offsetHeight - 120;
        //
        //    if (canvas.fabric.getHeight() > maxHeight || canvas.fabric.getWidth() > maxWidth) {
        //        var scale = Math.min(maxHeight / canvas.original.height, maxWidth / canvas.original.width);
        //        canvas.setZoom(scale);
        //    }
        //},

        //setZoom: function(factor) {
        //    this.fabric.setZoom(factor);
        //    this.fabric.setHeight(this.original.height * factor);
        //    this.fabric.setWidth(this.original.width * factor);
        //
        //    this.zoom = factor * 100;
        //
        //    $rootScope.$emit('zoom.changed', factor);
        //},

		//resetZoom: function() {
         //   this.fabric.setZoom(1);
         //   this.fabric.setHeight(this.original.height);
         //   this.fabric.setWidth(this.original.width);
        //
         //   this.zoom = 100;
		//}

	};

	return canvas;

}]);