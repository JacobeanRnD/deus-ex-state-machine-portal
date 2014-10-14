'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('MainCtrl', function($scope, dataService) {
        $scope.loading = true;

        function loadStatesharts() {
            dataService.getAllStateCharts().then(function(response) {
                response.data.forEach(function(name, i, arr) {
                    arr[i] = {
                        name: name
                    };
                });

                $scope.stateCharts = response.data;
                $scope.loading = false;
            });
        }

        function loadInstances(chartName) {
            dataService.getInstances(chartName).then(function(response) {
                response.data.forEach(function(id, i, arr) {
                    arr[i] = {
                        id: id
                    };
                });

                $scope.stateChart.instances = response.data;
            });
        }

        function draw() {
            var doc = (new DOMParser()).parseFromString($scope.stateChart.content, 'application/xml');
            var scxmlTrace = $('#scxmlTrace');

            scxmlTrace.empty();

            ScxmlViz(scxmlTrace[0], doc, scxmlTrace.width(), scxmlTrace.height()); // jshint ignore:line
        }

        loadStatesharts();

        $scope.selectStateChart = function(chart) {
            $scope.isCreating = false;
            $scope.stateChart = {
                name: chart.name,
                content: ''
            };

            dataService.getStateChart(chart.name).then(function(response) {
                $scope.stateChart.content = response.data;

                draw();

                loadInstances(chart.name);
            });
        };

        $scope.deleteStateChart = function(chart) {
            dataService.deleteStateChart(chart.name).then(function() {
                $scope.stateChart = null;
                loadStatesharts();
                alertify.success('Statechart deleted');
            });
        };

        $scope.selectInstance = function(instance) {
            $scope.stateChart.instance = instance;
            $scope.stateChart.instance.events = [];

            var source = dataService.subscribeInstance($scope.stateChart.name, instance.id);
            if(source) {
                source.addEventListener('onEntry', function(e) {
                    d3.select($('#scxmlTrace #' + e.data)[0]).classed('highlighted', true);
                    $scope.stateChart.instance.events.push('onEntry -> ' + e.data);
                }, false);
                source.addEventListener('onExit', function(e) {
                    d3.select($('#scxmlTrace #' + e.data)[0]).classed('highlighted', false);
                    $scope.stateChart.instance.events.push('onExit -> ' + e.data);
                }, false);
            }
        };

        $scope.deleteInstance = function(instance) {
            dataService.deleteInstance($scope.stateChart.name, instance.id).then(function() {
                $scope.stateChart.instance = null;
                loadInstances($scope.stateChart.name);
                alertify.success('Instance deleted');
            });
        };

        $scope.sendEvent = function(eventname, eventdata) {
            dataService.sendEvent($scope.stateChart.name, $scope.stateChart.instance.id, eventname, eventdata).then(function() {

            });
        };

        $scope.createStatechart = function() {
            $scope.stateChart = null;
            $scope.isCreating = true;
        };

        $scope.aceChanged = function() {
            draw();
        };

        $scope.saveStatechart = function(content) {
            var isError = false;

            if (!content || content.length === 0) {
                isError = true;
                alertify.error('Please enter code for your Statechart');
            }

            if (isError) {
                return;
            }

            dataService.createStateChart(content).then(function() {
                loadStatesharts();

                alertify.success('Statechart saved');

                $scope.stateChart = null;
                $scope.isCreating = false;
            }, function(response) {
                if (response.data.message) {
                    alertify.error(response.data.message);
                } else {
                    alertify.error('An error occured');
                }
            });
        };

        $scope.createInstance = function(stateChart) {
            dataService.createInstance(stateChart.name).then(function() {
                loadInstances(stateChart.name);

                alertify.success('Instance created');
            }, function(response) {
                if (response.data.message) {
                    alertify.error(response.data.message);
                } else {
                    alertify.error('An error occured');
                }
            });
        };
    });