'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:SimulationCtrl
 * @description
 * # SimulationCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('SimulationCtrl', function($scope, simulateService, dataService) {


        dataService.getAlgorithms().then(function (result) {
            $scope.algorithms = result.data.layoutAlgorithms;
            $scope.selectedAlgorithm = $scope.algorithms[0];

            drawSimulation(simulateService.chartContent, $scope.algorithms[0]);
        });

        function drawSimulation(content, algorithm) {
            var errorMessage;
            var doc = (new DOMParser()).parseFromString(content, 'application/xml');
            var scxmlTrace = $('#scxmlTrace');

            scxmlTrace.empty();

            try {
                $scope.layout = forceLayout.render({parent: scxmlTrace[0], doc: doc, kielerURL: '/kieler/layout', kielerAlgorithm: algorithm.id }); // jshint ignore:line

                $scope.toggleLayout();
            } catch (e) {
                errorMessage = e.message;
            } finally {
                if (errorMessage) {
                    $scope.error = errorMessage;
                } else {
                    $scope.error = null;
                }
            }
        }

        $scope.toggleLayout = function () {
            if($scope.forceLayoutEnabled) {
                $scope.layout.start();
            } else {
                $scope.layout.stop();
            }
        };

        $scope.changeAlgorithm = function (selectedAlgorithm) {
            drawSimulation(simulateService.chartContent, selectedAlgorithm);
        };

        $scope.$on('simulationContentUploaded', function() {
            drawSimulation(simulateService.chartContent, $scope.selectedAlgorithm);
        });

        $scope.$on('simulationHighlighted', function(e, eventName, event) {
            d3.select($('#scxmlTrace #' + event)[0]).classed('highlighted', eventName === 'onEntry');
        });
    });
