'use strict';

/**
 * @ngdoc service
 * @name deusExStateMachinePortalApp.dataService
 * @description
 * # dataService
 * Factory in the deusExStateMachinePortalApp.
 */
angular.module('deusExStateMachinePortalApp')
    .factory('dataService', function($resource, $http) {
        var hostname = '';
        
        return {
            getAllStateCharts: function(username) {
                return $http.get(hostname + '/api/' + username + '/_all_statechart_definitions');
            },
            getStateChart: function(username, stateChartId) {
                return $http.get(hostname + '/api/' + username + '/' + stateChartId);
            },
            getInstances: function(username, stateChartId) {
                return $http.get(hostname + '/api/' + username + '/' + stateChartId + '/_all_instances');
            },
            createStateChart: function(username, content) {
                return $http({
                    method: 'POST',
                    url: hostname + '/api/' + username,
                    headers: {
                        'Content-Type': 'application/xml'
                    },
                    data: content
                });
            },
            deleteStateChart: function(username, stateChartId) {
                return $http.delete(hostname + '/api/' + username + '/' + stateChartId);
            },
            getInstanceDetails: function(username, stateChartId, instanceId) {
                return $http.get(hostname + '/api/' + username + '/' + stateChartId + '/' + instanceId);
            },
            createInstance: function(username, stateChartId) {
                return $http.post(hostname + '/api/' + username + '/' + stateChartId);
            },
            deleteInstance: function(username, stateChartId, instanceId) {
                return $http.delete(hostname + '/api/' + username + '/' + stateChartId + '/' + instanceId);
            },
            sendEvent: function(username, stateChartId, instanceId, eventname, eventdata) {
                return $http({
                    method: 'POST',
                    url: hostname + '/api/' + username + '/' + stateChartId + '/' + instanceId,
                    data: {
                        name: eventname,
                        data: eventdata
                    }
                });
            },
            subscribeInstance: function(username, stateChartId, instanceId) {
                if (!!window.EventSource) {
                    var source = new EventSource(hostname + '/api/' + username + '/' + stateChartId + '/' + instanceId + '/_changes');

                    return source;
                } else {
                    return false;
                }
            },
            saveChannelData: function(username, channelname, tokenData) {
                return $http({
                    method: 'POST',
                    url: hostname + '/channels/' + username + '/' + channelname,
                    data: tokenData
                });
            }
        };
    });
