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
        $scope.loading = true;

        function loadStatesharts () {
            dataService.getAllStateCharts().then(function(response) {
                $scope.stateChartIds = response.data;
                $scope.loading = false;
            });
        }

        function loadInstances (chartName) {
            dataService.getInstances(chartName).then(function(response) {
                $scope.instances = response.data;
            });
        }

        loadStatesharts();

        $scope.selectStateChart = function(chartName) {
            $scope.isCreating = false;
            $scope.selectedChartName = chartName;
            $scope.instance = null;

            dataService.getStateChart(chartName).then(function(response) {
                $scope.stateChartContent = response.data;

                loadInstances(chartName);
            });
        };

        $scope.selectInstance = function(instanceId) {
            $scope.selectedInstanceId = instanceId;
        };

        $scope.createStatechart = function() {
            $scope.stateChartContent = null;
            $scope.stateChartName = null;
            $scope.instances = null;
            $scope.selectedInstanceId = null;
            $scope.isCreating = true;
        };

        $scope.aceChanged = function() {
            if (!$scope.stateChartContent) {
                return;
            }

            var doc = (new DOMParser()).parseFromString($scope.stateChartContent, 'application/xml');
            var scxmlTrace = $('#scxmlTrace');

            scxmlTrace.empty();

            ScxmlViz(scxmlTrace[0], doc, scxmlTrace.width(), scxmlTrace.height()); // jshint ignore:line
        };

        $scope.saveStatechart = function(stateChartContent) {
            var isError = false;

            if(!stateChartContent || stateChartContent.length === 0) {
                isError = true;
                alertify.error('Please enter code for your Statechart');
            }

            if(isError) {
                return;
            }

            dataService.createStateChart(stateChartContent).then(function () {
                loadStatesharts();

                alertify.success('Statechart saved');

                $scope.stateChartContent = null;
                $scope.stateChartName = null;
                $scope.instances = null;
                $scope.selectedInstanceId = null;
                $scope.isCreating = false;
            }, function(response) {
                if(response.data.message) {
                    alertify.error(response.data.message);
                } else {
                    alertify.error('An error occured');
                }
            });
        };

        $scope.createInstance = function (stateChartName) {
            dataService.createInstance(stateChartName).then(function () {
                loadInstances(stateChartName);

                alertify.success('Instance created');
            }, function(response) {
                if(response.data.message) {
                    alertify.error(response.data.message);
                } else {
                    alertify.error('An error occured');
                }
            });
        }
    });