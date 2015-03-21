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
    var scxmlTrace = $('#scxmlTrace');

    function drawSimulation(content, done) {
      var doc = (new DOMParser()).parseFromString(content, 'application/xml');

      if (doc.getElementsByTagName('parsererror').length) {
        return done({ message: $(doc).find('parsererror div').html() });
      }

      if($scope.layout) {
        $scope.layout.unhighlightAllStates();
        $scope.layout.update(doc).then(done);
      } else {
        scxmlTrace.empty();

        $scope.layout = new forceLayout.Layout({ // jshint ignore:line
          kielerAlgorithm: '__klayjs',
          parent: scxmlTrace[0],
          doc: doc,
          textOnPath: false,
          routing: 'ORTHOGONAL',
          debug: false,
          geometry: $cookies[chartName + '/geometry']
        });

        $scope.layout.initialized.then(done);
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

    function onSimulationDone (err) {
      if(err && err.message) {
        console.log('err', err);
        $scope.error = err.message;
      } else {
        console.log('no err');
        delete $scope.error;
        $scope.layout.fit();

        if(waitingHighlights.length) {
          waitingHighlights.forEach(function (highlight) {
            simulateService.events.highlight(highlight.eventName, highlight.event);
          });

          //Clean the queue
          waitingHighlights = [];
        }
      }

      //Propagate scope update because this function is async 
      $scope.$apply();
    }

    drawSimulation(simulateService.chartContent, onSimulationDone);

    var updateLayout = _.debounce(function () {
      drawSimulation(simulateService.chartContent, onSimulationDone);
    }, 500);

    $scope.$on('simulationContentUploaded', function () {
      updateLayout();
    });

    $scope.$on('chartSaved', function (e, chartName) {
      $cookies[chartName + '/geometry'] = $scope.layout.saveGeometry();
    });
  });

