'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('MainCtrl', function($scope, $routeParams, dataService) {

        


        dataService.getAllStateCharts().query().$promise.then(function(stateCharts) {
            $scope.stateCharts = stateCharts;
        });
        

        $scope.prettify = function(scxml) {
            return htmlDecode(scxml);
        };

        $scope.selectStateChart = function(chartId) {
            $scope.instance = null;

            dataService.getStateChart().get({ stateChartId: chartId }, function(stateChart) {
                $scope.stateChart = stateChart;

                dataService.getInstances().query().$promise.then(function(instances) {
                    $scope.instances = instances;
                });
            });
        };

        $scope.selectInstance = function(instanceId) {
            $scope.instance = { id: instanceId };
        };
        
        $scope.createChart = function() {
            $scope.instance = null;
            $scope.instances = null;
            $scope.stateChart = null;
            $scope.isCreating = true;             
        };

        function htmlDecode(input){
            var e = document.createElement('div');
            e.innerHTML = input;
            return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
        }
    });