'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('EditorCtrl', function($scope, $state, simulateService, chartName, chartContent) {
        $scope.chartContent = chartContent.data;

        simulateService.update($scope.chartContent);

        $scope.aceChanged = function() {
            simulateService.update($scope.chartContent);
        };

        
    });