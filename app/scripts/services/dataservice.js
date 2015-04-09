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
    var hostname = window.simulationServerUrl;

    return {
      createAccount: function (username, email, password) {
        return $http({
          method: 'POST',
          url: hostname + '/api/v1/_users',
          data: {
            username: username,
            password: password,
            email: email
          }
        });
      },
      login: function (username, password, emailtoken) {
        return $http({
          method: 'POST',
          url: hostname + '/api/v1/' + username + '/_session',
          params: {
            username: username,
            password: password,
            emailtoken: emailtoken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      },
      logout: function (username) {
        return $http.delete(hostname + '/api/v1/' + username + '/_session');
      },
      checkAccount: function (username) {
        return $http.get(hostname + '/api/v1/' + username + '/_session');
      },
      getToken: function (username) {
        return $http.get(hostname + '/api/v1/' + username + '/_token');
      },
      refreshToken: function (username) {
        return $http.post(hostname + '/api/v1/' + username + '/_token');
      },
      getAllStateCharts: function (username) {
        return $http.get(hostname + '/api/v1/' + username + '/_all_statechart_definitions');
      },
      getStateChart: function (username, stateChartName) {
        return $http.get(hostname + '/api/v1/' + username + '/' + stateChartName);
      },
      getInstances: function (username, stateChartName) {
        return $http.get(hostname + '/api/v1/' + username + '/' + stateChartName + '/_all_instances');
      },
      saveStateChart: function (stateChartName, username, content) {
        if (stateChartName) {
          //Update current statechart
          return $http({
            method: 'PUT',
            url: hostname + '/api/v1/' + username + '/' + stateChartName,
            headers: {
              'Content-Type': 'application/xml'
            },
            data: content
          });
        } else {
          //Insert new statechart
          return $http({
            method: 'POST',
            url: hostname + '/api/v1/' + username,
            headers: {
              'Content-Type': 'application/xml'
            },
            data: content
          });
        }
      },
      deleteStateChart: function (username, stateChartName) {
        return $http.delete(hostname + '/api/v1/' + username + '/' + stateChartName);
      },
      getInstanceDetails: function (username, stateChartName, instanceId) {
        return $http.get(hostname + '/api/v1/' + username + '/' + stateChartName + '/' + instanceId);
      },
      createInstance: function (username, stateChartName) {
        return $http.post(hostname + '/api/v1/' + username + '/' + stateChartName);
      },
      deleteInstance: function (username, stateChartName, instanceId) {
        return $http.delete(hostname + '/api/v1/' + username + '/' + stateChartName + '/' + instanceId);
      },
      sendEvent: function (username, stateChartName, instanceId, eventname, eventdata) {
        return $http({
          method: 'POST',
          url: hostname + '/api/v1/' + username + '/' + stateChartName + '/' + instanceId,
          data: {
            name: eventname,
            data: eventdata ? JSON.parse(eventdata) : ''
          }
        });
      },
      getInstanceEvents: function (username, stateChartName, instanceId) {
        return $http.get(hostname + '/api/v1/' + username + '/' + stateChartName + '/' + instanceId + '/_eventLog');
      },
      subscribeInstance: function (username, stateChartName, instanceId) {
        if (!!window.EventSource) {
          var source = new EventSource(hostname + '/api/v1/' + username + '/' + stateChartName + '/' + instanceId + '/_changes', {
            withCredentials: true
          });

          return source;
        } else {
          return false;
        }
      }
    };
  });

