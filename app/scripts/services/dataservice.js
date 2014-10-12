'use strict';

/**
 * @ngdoc service
 * @name deusExStateMachinePortalApp.dataService
 * @description
 * # dataService
 * Factory in the deusExStateMachinePortalApp.
 */
angular.module('deusExStateMachinePortalApp')
  .factory('dataService', function ($resource, $http) {
    // Service logic
    // ...

    var hostname = 'http://localhost:3000';
    var username = 'jake';

    // Public API here
    return {
      getAllStateCharts: function () { // jshint ignore:line
        //TODO Query with username.
        return $http.get(hostname + '/api/' + username + '/_all_statechart_definitions');
      },
      getStateChart: function (stateChartId) { // jshint ignore:line
        //TODO Query with definitionId
        return $http.get(hostname + '/api/' + username + '/' + stateChartId);
      },
      getInstances: function (stateChartId) { // jshint ignore:line
        //TODO Query with definitionId
        return $http.get(hostname + '/api/' + username + '/' + stateChartId + '/_all_instances');
      }
    };
  });
