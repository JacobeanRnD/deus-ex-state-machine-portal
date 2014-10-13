'use strict';

/**
 * @ngdoc service
 * @name deusExStateMachinePortalApp.Session
 * @description
 * # Session
 * Service in the deusExStateMachinePortalApp.
 */
angular.module('deusExStateMachinePortalApp')
    .service('Session', function Session($rootScope, $http, $q, $cookies) {
        var session = {
            login: function(username) {
                var deferred = $q.defer();

                setTimeout(function() {
                    $cookies.deusExStateMachinePortalAppUsername = username;
                    session.username = username;
                    deferred.resolve();
                }, 200);

                return deferred.promise;
            },
            refresh: function() {
                var deferred = $q.defer();

                setTimeout(function() {
                    session.username = $cookies.deusExStateMachinePortalAppUsername;
                    deferred.resolve();
                }, 200);

                return deferred.promise;
            },
            logout: function() {
                var deferred = $q.defer();

                setTimeout(function() {
                    delete $cookies.deusExStateMachinePortalAppUsername;
                    delete session.username;
                    deferred.resolve();
                }, 200);

                return deferred.promise;
            }
        };

        return session;
    });