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
      login: function (username, password, emailtoken, cb) {
        dataService.login(username, password, emailtoken).then(function () {
          session.username = username;
          $cookies.username = session.username;
          cb(null);
        }, function (error) {
          cb(error);
        });
      },
      refresh: function () {
        var deferred = $q.defer();

        if(window.isSCXMLD) {
          session.username = 'SCXMLD';
          deferred.resolve();
        }

        if (session.username) {
          deferred.resolve();
        } else if ($cookies.username) {
          dataService.checkAccount($cookies.username).then(function (result) {
            session.username = result.data.data.username;
            deferred.resolve();
          }, function () {
            delete $cookies.username;
            deferred.resolve();
          });
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      },
      logout: function () {
        var deferred = $q.defer();

        if (session.username) {
          dataService.logout(session.username).then(function () {
            delete session.username;
            delete $cookies.username;
            deferred.resolve();
          }, function () {
            deferred.resolve();
          });
        } else if ($cookies.username) {
          delete $cookies.username;
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      }
    };

    return session;
  });

