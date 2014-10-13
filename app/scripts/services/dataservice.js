'use strict';

/**
 * @ngdoc service
 * @name deusExStateMachinePortalApp.dataService
 * @description
 * # dataService
 * Factory in the deusExStateMachinePortalApp.
 */
angular.module('deusExStateMachinePortalApp')
    .factory('dataService', function($resource, $http, Session) {
        // Service logic
        // ...

        var hostname = 'http://localhost:3000';
        var username = Session.username;

        // Public API here
        return {
            getAllStateCharts: function() {
                return $http.get(hostname + '/api/' + username + '/_all_statechart_definitions');
            },
            getStateChart: function(stateChartId) {
                return $http.get(hostname + '/api/' + username + '/' + stateChartId);
            },
            getInstances: function(stateChartId) {
                return $http.get(hostname + '/api/' + username + '/' + stateChartId + '/_all_instances');
            },
            createStateChart: function(content) {
                return $http({
                    method: 'POST',
                    url: hostname + '/api/' + username,
                    headers: {
                        'Content-Type': 'application/xml'
                    },
                    data: content
                });
            },
            createInstance: function(stateChartId) {
                return $http.post(hostname + '/api/' + username + '/' + stateChartId);
            },

        };
    });