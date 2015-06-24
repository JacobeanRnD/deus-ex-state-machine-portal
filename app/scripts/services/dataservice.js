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
    var baseUrl = hostname + '/api/v3/';

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
          url: baseUrl + '_session',
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
      logout: function () {
        return $http.delete(baseUrl + '_session');
      },
      checkAccount: function () {
        return $http.get(baseUrl + '_session');
      },
      getToken: function () {
        return $http.get(baseUrl + '_token');
      },
      refreshToken: function () {
        return $http.post(baseUrl + '_token');
      },
      getStateChart: function () {
        return $http.get(baseUrl);
      },
      getInstances: function () {
        return $http.get(baseUrl + '_all_instances');
      },
      getInstanceDetails: function (instanceId) {
        return $http.get(baseUrl + instanceId);
      },
      createInstance: function () {
        return $http.post(baseUrl);
      },
      deleteInstance: function (instanceId) {
        return $http.delete(baseUrl + instanceId);
      },
      sendEvent: function (instanceId, eventname, eventdata) {
        return $http({
          method: 'POST',
          url: baseUrl + instanceId,
          data: {
            name: eventname,
            data: eventdata ? JSON.parse(eventdata) : ''
          }
        });
      },
      getInstanceEvents: function (instanceId) {
        return $http.get(baseUrl + instanceId + '/_eventLog');
      },
      subscribeInstance: function (instanceId) {
        if (!!window.EventSource) {
          var options = { };

          if(!window.isSCXMLD) options = { withCredentials: true };

          var source = new EventSource(baseUrl + instanceId + '/_changes', options);

          return source;
        } else {
          return false;
        }
      }
    };
  });

