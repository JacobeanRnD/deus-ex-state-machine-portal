'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:SimulationCtrl
 * @description
 * # SimulationCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
  .controller('SimulationCtrl', function ($scope, $rootScope, $timeout, $cookies, $state, chartName, simulateService) {
    $scope.forceLayoutEnabled = true;
    var scxmlTrace = $('#scxmlTrace');

    function drawSimulation(content) {
      var errorMessage;

      try {
        var doc = (new DOMParser()).parseFromString(content, 'application/xml');

        if (doc.getElementsByTagName('parsererror').length) {
          throw ({
            //Only div in parsererror contains the error message
            //If there is more than one error, browser shows only the first error
            message: $(doc).find('parsererror div').html()
          });
        }

        if ($scope.layout) {
          $scope.layout.update(doc);
        } else {
          scxmlTrace.empty();
          $scope.layout = new forceLayout.Layout({ // jshint ignore:line
            parent: scxmlTrace[0],
            doc: doc,
            kielerAlgorithm: '__klayjs',
            debug: false,
            routing: 'ORTHOGONAL',
            textOnPath: false,
            geometry: $cookies[chartName + '/geometry']
          });
        }
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

    var updateLayout = _.debounce(function () {
      drawSimulation(simulateService.chartContent);
    }, 500);

    $scope.$on('simulationContentUploaded', function () {
      updateLayout();
    });

    $scope.$on('simulationHighlighted', function (e, eventName, event) {
      if ($scope.layout && $scope.layout.highlightState) {
        $scope.layout.highlightState(event, eventName === 'onEntry');
      } else {
        //Small queue system that tries to highlight every second.
        $timeout(function () {
          simulateService.events.highlight(eventName, event);
        }, 1000);
      }
    });

    $scope.$on('chartSaved', function (e, chartName) {
      $cookies[chartName + '/geometry'] = $scope.layout.saveGeometry();
    });
  });

