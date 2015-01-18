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
      createAccount: function (username, password) {
        return $http({
          method: 'POST',
          url: hostname + '/api/',
          data: {
            username: username,
            password: password
          }
        });
      },
      login: function (username, password) {
        return $http({
          withCredentials: true,
          method: 'POST',
          url: hostname + '/api/' + username + '/_session',
          params: {
            username: username,
            password: password
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      },
      getAllStateCharts: function (username) {
        return $http.get(hostname + '/api/' + username + '/_all_statechart_definitions');
      },
      getStateChart: function (username, stateChartName) {
        return $http.get(hostname + '/api/' + username + '/' + stateChartName);
      },
      getInstances: function (username, stateChartName) {
        return $http.get(hostname + '/api/' + username + '/' + stateChartName + '/_all_instances');
      },
      saveStateChart: function (stateChartName, username, content) {
        if (stateChartName) {
          //Update current statechart
          return $http({
            method: 'PUT',
            url: hostname + '/api/' + username + '/' + stateChartName,
            headers: {
              'Content-Type': 'application/xml'
            },
            data: content
          });
        } else {
          //Insert new statechart
          return $http({
            method: 'POST',
            url: hostname + '/api/' + username,
            headers: {
              'Content-Type': 'application/xml'
            },
            data: content
          });
        }
      },
      deleteStateChart: function (username, stateChartName) {
        return $http.delete(hostname + '/api/' + username + '/' + stateChartName);
      },
      getInstanceDetails: function (username, stateChartName, instanceId) {
        return $http.get(hostname + '/api/' + username + '/' + stateChartName + '/' + instanceId);
      },
      createInstance: function (username, stateChartName) {
        return $http.post(hostname + '/api/' + username + '/' + stateChartName);
      },
      deleteInstance: function (username, stateChartName, instanceId) {
        return $http.delete(hostname + '/api/' + username + '/' + stateChartName + '/' + instanceId);
      },
      sendEvent: function (username, stateChartName, instanceId, eventname, eventdata) {
        return $http({
          method: 'POST',
          url: hostname + '/api/' + username + '/' + stateChartName + '/' + instanceId,
          data: {
            name: eventname,
            data: eventdata ? JSON.parse(eventdata) : ''
          }
        });
      },
      subscribeInstance: function (username, stateChartName, instanceId) {
        if (!!window.EventSource) {
          var source = new EventSource(hostname + '/api/' + username + '/' + stateChartName + '/' + instanceId + '/_changes');

          return source;
        } else {
          return false;
        }
      },
      getAlgorithms: function () {
        return $http.get('http://kieler.herokuapp.com/layout/serviceData', {
          cache: true
        });
      },
      saveChannelData: function (username, channelname, tokenData) {
        return $http({
          method: 'POST',
          url: hostname + '/channels/' + username + '/' + channelname,
          data: tokenData
        });
      },
      getSparkDevicesOnSpark: function (accessToken) {
        return $http.get('https://api.spark.io/v1/devices?access_token=' + accessToken);
      },
      saveSparkDevices: function (username, channelname, accessToken, devices) {
        return $http({
          method: 'POST',
          url: hostname + '/channels/' + username + '/' + channelname,
          data: {
            token: accessToken,
            devices: devices
          }
        });
      },
      getSparkDevices: function (username) {
        return $http.get(hostname + '/channels/' + username + '/spark');
      },
      getConnectedSparkDevice: function (username, stateChartName, instanceId) {
        return $http.get(hostname + '/channels/' + username + '/spark/' + stateChartName + '/' + instanceId);
      },
      connectSparkDevice: function (username, device, listeningEvents, stateChartName, instanceId) {
        return $http({
          method: 'POST',
          url: hostname + '/channels/' + username + '/spark/' + stateChartName + '/' + instanceId,
          data: {
            device: device,
            listeningEvents: listeningEvents
          }
        });
      }
    };
  });

