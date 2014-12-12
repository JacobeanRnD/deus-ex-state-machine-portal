'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:SimulationCtrl
 * @description
 * # SimulationCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('SimulationCtrl', function($scope, simulateService) {

        $scope.selectedAlgorithm = 'de.cau.cs.kieler.klay.layered';

        function drawSimulation(content, force, algorithm) {
            var errorMessage;
            var doc = (new DOMParser()).parseFromString(content, 'application/xml');
            var scxmlTrace = $('#scxmlTrace');

            scxmlTrace.empty();

            try {
                $scope.layout = forceLayout.render({parent: scxmlTrace[0], doc: doc, kielerURL: '/kieler/layout', kielerAlgorithm: algorithm }); // jshint ignore:line
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

        drawSimulation(simulateService.chartContent);

        $scope.toggleLayout = function () {
            if($scope.forceLayout) {
                $scope.layout.stop();
            } else {
                $scope.layout.start();
            }
        };

        $scope.$on('simulationContentUploaded', function() {
            drawSimulation(simulateService.chartContent);
        });

        $scope.$on('simulationHighlighted', function(e, eventName, event) {
            d3.select($('#scxmlTrace #' + event)[0]).classed('highlighted', eventName === 'onEntry');
        });
    });
