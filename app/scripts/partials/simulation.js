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

        function drawSimulation(content) {
            var errorMessage;
            var doc = (new DOMParser()).parseFromString(content, 'application/xml');
            var scxmlTrace = $('#scxmlTrace');

            scxmlTrace.empty();

            try {
                forceLayout.render({parent: scxmlTrace[0], doc: doc, kielerURL: '/kieler/layout', kielerAlgorithm: 'de.cau.cs.kieler.klay.layered'}); // jshint ignore:line
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

        $scope.$on('simulationContentUploaded', function() {
            drawSimulation(simulateService.chartContent);
        });

        $scope.$on('simulationHighlighted', function(e, eventName, event) {
            d3.select($('#scxmlTrace #' + event)[0]).classed('highlighted', eventName === 'onEntry');
        });
    });
