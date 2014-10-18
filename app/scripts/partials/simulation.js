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
            var doc = (new DOMParser()).parseFromString(content, 'application/xml');
            var scxmlTrace = $('#scxmlTrace');

            scxmlTrace.empty();

            ScxmlViz(scxmlTrace[0], doc, scxmlTrace.width(), scxmlTrace.height()); // jshint ignore:line
        }

        drawSimulation(simulateService.chartContent);
        $scope.$on('simulationContentUploaded', function() {
            drawSimulation(simulateService.chartContent);
        });
    });