'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:SimulationCtrl
 * @description
 * # SimulationCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('SimulationCtrl', function($scope, $rootScope, $timeout, simulateService, dataService) {
        $scope.forceLayoutEnabled = true;

        dataService.getAlgorithms().then(function (result) {
            $scope.algorithms = result.data.layoutAlgorithms;
            $scope.selectedAlgorithm = $scope.algorithms.filter(function (algorithm) {
                return algorithm.id === 'de.cau.cs.kieler.klay.force';
            })[0];

            drawSimulation(simulateService.chartContent, $scope.algorithms[0]);
        });

        function drawSimulation(content, algorithm) {
            var errorMessage;
            var doc = (new DOMParser()).parseFromString(content, 'application/xml');
            var scxmlTrace = $('#scxmlTrace');

            if( doc.getElementsByTagName('parsererror').length ){
              //there was a parser error, but for some reason it didn't throw an exception
              return;
            }

            scxmlTrace.empty();

            try {
                $scope.layout = new forceLayout.Layout({// jshint ignore:line
                    parent: scxmlTrace[0],
                    doc: doc,
                    kielerAlgorithm: algorithm.id,
                    debug: false
                });

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
            if($scope.layout && $scope.layout.highlightState) {
                $scope.layout.highlightState(event, eventName === 'onEntry');    
            } else {
                //Small queue system that tries to highlight every second.
                $timeout(function() {
                    simulateService.events.highlight(eventName, event);
                }, 1000);
            }
        });
    });
