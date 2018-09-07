'use strict';

angular.module('ImageEditor')

.factory('saver', ['$rootScope', '$mdDialog', '$http', 'canvas', function($rootScope, $mdDialog, $http, canvas) {

	var saver = {

        saveImage: function(format, quality, name, e) {
            if ($rootScope.isDemo) {
                return this.handleDemoSiteSave(e);
            }

            if ($rootScope.isIntegrationMode()) {
                return this.handleIntegrationModeSave(format, quality);
            }

            this.saveToComputer(format, quality, name);
        },

        handleIntegrationModeSave: function(format, quality) {
            canvas.resetZoom();
            var data = this.getDataUrl(format, quality);

            //replace image src with new data url in original window
            if ($rootScope.pixie.getParams().replaceOriginal && $rootScope.pixie.getParams().image) {
                $rootScope.pixie.getParams().image.src = data;
            }

            //send image data to user specified url
            if ($rootScope.pixie.getParams().saveUrl) {
                $http.post($rootScope.pixie.getParams().saveUrl, { data: data });
            }

            if ($rootScope.pixie.getParams().onSave) {
                var img = $rootScope.pixie.getParams().image || new Image(data);
                $rootScope.pixie.getParams().onSave(data, img);
            }

            $mdDialog.hide();
            $rootScope.pixie.close();
        },

        saveToComputer: function(format, quality, name) {
            canvas.resetZoom();

            var link = document.createElement('a');

            //browser supports html5 download attribute
            if (typeof link.download !== 'undefined') {
                var data = this.getDataUrl(format, quality);

                link.download = (name || 'image')+'.'+format;
                link.href = data;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            //canvas blob and file saver workaround
            else {
                canvas.fabric.lowerCanvasEl.toBlob(function(blob) {
                    saveAs(blob, name+'.'+format);
                }, 'image/'+format, quality);
            }

            $mdDialog.hide();
        },

        handleDemoSiteSave: function(e) {
            $('.demo-alert').one($rootScope.animationEndEvent, function() {
                $(this).removeClass('animated shake');  e.target.blur();
            }).addClass('animated shake');
        },

        getDataUrl: function(format, quality) {
            return canvas.fabric.toDataURL({
                format: format || 'png',
                quality: (quality || 8) / 10
            });
        }
	};

	return saver;
}]);