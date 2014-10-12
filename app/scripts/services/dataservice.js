'use strict';

/**
 * @ngdoc service
 * @name deusExStateMachinePortalApp.dataService
 * @description
 * # dataService
 * Factory in the deusExStateMachinePortalApp.
 */
angular.module('deusExStateMachinePortalApp')
  .factory('dataService', function ($resource) {
    // Service logic
    // ...

    // Public API here
    return {
      getAllStateCharts: function (username) { // jshint ignore:line
        //TODO Query with username.
        return $resource('scripts/mocks/definitions.json');
      },
      getStateChart: function () { // jshint ignore:line
        //TODO Query with definitionId
        return $resource('scripts/mocks/definition/:stateChartId.json', { stateChartId: '@stateChartId' });
      },
      getInstances: function () { // jshint ignore:line
        //TODO Query with definitionId
        // return $resource('scripts/mocks/instances/:stateChartId.json', { stateChartId: '@stateChartId' });
        return $resource('scripts/mocks/instances.json');
      }
    };
  });
