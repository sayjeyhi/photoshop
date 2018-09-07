'use strict';

angular.module('ImageEditor')

.controller('TopPanelController', ['$rootScope', '$scope', '$mdDialog', '$mdToast', '$$rAF', 'canvas', 'history', 'saver', function($rootScope, $scope, $mdDialog, $mdToast, $$rAF, canvas, history, saver) {

    $scope.history = history;

    $scope.isDemo = $rootScope.isDemo;
    $scope.canOpenImage = false;
    $scope.canvas = canvas;
    $scope.openImageMode = 'open';

    $scope.canvasWidth = 800;
    $scope.canvasHeight = 600;

    $scope.imageName = 'image';
    $scope.imageType = 'jpeg';
    $scope.imageQuality = 8;

    $scope.objectsPanelOpen = true;
    $scope.historyPanelOpen = false;

    $scope.openUploadDialog = function($event) {
        $mdDialog.show({
            template: $('#main-image-upload-dialog-template').html(),
            targetEvent: $event,
            controller: 'TopPanelController'
        });
    };

    $scope.toggleRightPanel = function(name, e) {
        var panelIsOpen = $scope[name+'PanelOpen'];

        if (panelIsOpen) {
            $scope[name+'PanelOpen'] = false;
            $scope.transformClose(name, e);
        } else {
            $scope[name+'PanelOpen'] = true;
            $scope.transformOpen(name, e);
        }
    };

    $scope.transformOpen = function(name, e) {
        var panel = $('#'+name);

        panel.removeClass('transition-out transition-in').show();
        $scope.transformToClickElement(panel, e);

        $$rAF(function() {
            panel.addClass('transition-in').css('transform', '');
            e.currentTarget.blur();
        });
    };

    $scope.transformClose = function(name, e) {
        var panel = $('#'+name);

        panel.addClass('transition-out').removeClass('transition-in');
        $scope.transformToClickElement(panel, e);

        panel.one($rootScope.transitionEndEvent, function() {
            panel.hide().css('transform', '').removeClass('transition-out');
            e.currentTarget.blur();
        });
    };

    $scope.transformToClickElement = function(panel, e) {
        var clickRect = e.target.getBoundingClientRect();
        var panelRect = panel[0].getBoundingClientRect();

        var scaleX = Math.min(0.5, clickRect.width / panelRect.width);
        var scaleY = Math.min(0.5, clickRect.height / panelRect.height);

        panel.css('transform', 'translate3d(' +
            (-panelRect.left + clickRect.left + clickRect.width/2 - panelRect.width/2) + 'px,' +
            (-panelRect.top + clickRect.top + clickRect.height/2 - panelRect.height/2) + 'px,' +
            '0) scale(' + scaleX + ',' + scaleY + ')'
        );
    };

    $scope.openSaveDialog = function($event) {

        if ($rootScope.isIntegrationMode() && $rootScope.pixie.getParams().onSaveButtonClick) {
            return $rootScope.pixie.getParams().onSaveButtonClick();
        }

        $mdDialog.show({
            template: $('#save-image-dialog').html(),
            targetEvent: $event,
            controller: 'TopPanelController'
        });
    };

    $scope.createNewCanvas = function(width, height) {
        canvas.openNew(width, height);
        $scope.closeUploadDialog();
        $rootScope.started = true;
    };

    $scope.openSampleImage = function() {
        canvas.loadMainImage('assets/images/lotus.jpg');
        $scope.closeUploadDialog();
        $rootScope.started = true;
    };

    $scope.saveImage = function($event) {
        saver.saveImage($scope.imageType, $scope.imageQuality, $scope.imageName, $event);
    };

    $scope.showImagePreview = function(url) {

        fabric.util.loadImage(url, function(image) {
            if (image) {
                $scope.$apply(function() {
                    $('.img-preview').html('').append(image);
                    $scope.canOpenImage = true;
                });
            } else {
                $scope.$apply(function() {
                    $scope.canOpenImage = false;
                });
            }
        });
    };

    $scope.openImage = function() {
        var url = $('.img-preview img').attr('src');

        if ( ! url || ! $scope.canOpenImage) return;

        if ( !canvas.fabric._objects.length || ! canvas.mainImage) {
            canvas.fabric.clear();
            canvas.loadMainImage(url);
        } else {
            fabric.util.loadImage(url, function(image) {
                if ( ! image) return;

                var object = new fabric.Image(image);
                object.name = 'image';

                canvas.fabric.add(object);
                object.center();
                object.setCoords();
                canvas.fabric.setActiveObject(object);
                canvas.fabric.renderAll();
            });
        }

        $scope.closeUploadDialog();
        $rootScope.started = true;
    };

    $scope.closeUploadDialog = function() {
        $scope.canUploadImage = false;
        $scope.openImageMode = 'open';
        $('.img-preview').html();
        $mdDialog.hide();
    };
}]);



