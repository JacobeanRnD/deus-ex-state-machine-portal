'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:SimulationCtrl
 * @description
 * # SimulationCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
  .controller('SimulationCtrl', function ($scope, $rootScope, $timeout, $cookies, $state, simulateService) {
    var scxmlTrace = $('#scxmlTrace');

    function drawSimulation(content, onDone, onError) {
      var doc = (new DOMParser()).parseFromString(content, 'application/xml');

      if (doc.getElementsByTagName('parsererror').length) {
        return onError({ message: $(doc).find('parsererror div').html() });
      }

      if($scope.layout) {
        $scope.layout.unhighlightAllStates();
        $scope.layout.update(doc).then(onDone, onError);
      } else {
        scxmlTrace.empty();

        $scope.layout = new forceLayout.Layout({ // jshint ignore:line
          parent: scxmlTrace[0],
          doc: doc
        });

        $scope.layout.initialized.then(onDone, onError);
      }
    }   

    var waitingHighlights = [];
    $scope.$on('simulationHighlighted', function (e, eventName, event) {
      if ($scope.layout && $scope.layout.highlightState) {
        $scope.layout.highlightState(event, eventName === 'onEntry');
      } else {
        //Queue highlights when layout is not ready
        waitingHighlights.push({ eventName: eventName, event: event });
      }
    });

    function onSimulationError (err) {
      $scope.error = err.message;
      $scope.$apply();
    }

    function onSimulationDone () {
      if(waitingHighlights.length) {
        waitingHighlights.forEach(function (highlight) {
          simulateService.events.highlight(highlight.eventName, highlight.event);
        });

        //Clean the queue
        waitingHighlights = [];
      }

      if($scope.error) {
        delete $scope.error;
        $scope.$apply();
      }
    }

    drawSimulation(simulateService.chartContent, function (result) {
      //Fit the simulation just for the first time
      $scope.layout.fit();
      
      onSimulationDone(result);
    }, onSimulationError);

    var updateLayout = _.debounce(function () {
      drawSimulation(simulateService.chartContent, onSimulationDone, onSimulationError);
    }, 500);

    $scope.$on('simulationContentUploaded', function () {
      updateLayout();
    });
  });

