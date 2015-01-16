'use strict';

/**
 * @ngdoc service
 * @name deusExStateMachinePortalApp.Session
 * @description
 * # Session
 * Service in the deusExStateMachinePortalApp.
 */
angular.module('deusExStateMachinePortalApp')
  .service('Session', function Session($rootScope, $http, $q, $cookies, dataService) {
    var session = {
      login: function (username, password, cb) {
        dataService.login(username, password).then(function () {
          session.username = username;
          cb(null);
        }, function (error) {
          cb(error);
        });
      },
      refresh: function () {
        var deferred = $q.defer();

        setTimeout(function () {
          session.username = $cookies.deusExStateMachinePortalAppUsername;
          deferred.resolve();
        }, 200);

        return deferred.promise;
      },
      logout: function () {
        var deferred = $q.defer();

        setTimeout(function () {
          delete $cookies.deusExStateMachinePortalAppUsername;
          delete session.username;
          deferred.resolve();
        }, 200);

        return deferred.promise;
      }
    };

    return session;
  });

