'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('MainCtrl', function($rootScope, $scope, dataService) {

        dataService.getAllStateCharts().then(function(response) {
            $scope.stateChartIds = response.data;
        });

        $scope.prettify = function(scxml) {
            return htmlDecode(scxml);
        };

        $scope.selectStateChart = function(chartName) {
            $scope.selectedChartName = chartName;
            $scope.instance = null;

            dataService.getStateChart(chartName).then(function(response) {
                $scope.stateChartContent = response.data;

                dataService.getInstances(chartName).then(function(response) {
                    $scope.instances = response.data;
                });
            });
        };

        $scope.selectInstance = function(instanceId) {
            $scope.selectedInstanceId = instanceId;
        };
        
        $scope.createChart = function() {
            $scope.stateChartContent = null;
            $scope.stateChartName  = null;
            $scope.instances = null;
            $scope.selectedInstanceId = null;
            $scope.isCreating = true;
        };

        function htmlDecode(input){
            var e = document.createElement('div');
            e.innerHTML = input;
            return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
        }
    });
