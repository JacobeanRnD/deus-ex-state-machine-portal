'use strict';

/**
 * @ngdoc overview
 * @name deusExStateMachinePortalApp
 * @description
 * # deusExStateMachinePortalApp
 *
 * Main module of the application.
 */
var app = angular.module('deusExStateMachinePortalApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch'
    ])
    .config(function($routeProvider) {

        function checkLoggedin(Session, $location) {

                // Initialize a new promise var deferred = $q.defer(); 
                if (Session.username) {
                    return true;
                } else {
                    return Session.refresh().then(function() {
                        if (Session.username) {
                            return true;
                        } else {
                            $location.url('/login');
                        }
                    });
                }
            }
            /* jshint ignore:end */

        $routeProvider
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/statechart/:stateChartId', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/statechart/:stateChartId/instance/:instanceId', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    });

app.run(function($rootScope, Session, $location) {
    $rootScope.Session = Session;

    $rootScope.logout = function() {
        Session.logout().then(function() {
            $location.url('/login');
        });
    };
});