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
        'ngTouch',
        'ui.ace',
        'ui.router'
    ])
    .config(function($routeProvider, $stateProvider, $urlRouterProvider) {

        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise('');
        
        // Now set up the states
        $stateProvider
            .state('main', {
                url: '/',
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    charts: function (dataService) {
                        return dataService.getAllStateCharts().then(function(response) {
                            return response;
                        });
                    }
                }
            })
            .state('login', {
                url: '/',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .state('main.chartdetail', {
                url: 'statechart/:chartName',
                views: {
                    'instancelist' : {
                        templateUrl: 'views/partials/instances.html',
                        controller: 'InstancesCtrl',
                        resolve: {
                            instances: function (dataService, $stateParams) {
                                return dataService.getInstances($stateParams.chartName).then(function(response) {
                                    return response;
                                });
                            },
                            chartName: function ($stateParams) {
                                return $stateParams.chartName;
                            }
                        }
                    }
                }
            });

        // $routeProvider
        //     .when('/login', {
        //         templateUrl: 'views/login.html',
        //         controller: 'LoginCtrl'
        //     })
        //     .when('/', {
        //         templateUrl: 'views/main.html',
        //         controller: 'MainCtrl',
        //         resolve: {
        //             loggedin: checkLoggedin
        //         }
        //     })
        //     .when('/statechart/:stateChartId', {
        //         templateUrl: 'views/main.html',
        //         controller: 'MainCtrl',
        //         resolve: {
        //             loggedin: checkLoggedin
        //         }
        //     })
        //     .when('/statechart/:stateChartId/instance/:instanceId', {
        //         templateUrl: 'views/main.html',
        //         controller: 'MainCtrl',
        //         resolve: {
        //             loggedin: checkLoggedin
        //         }
        //     })
        //     .otherwise({
        //         redirectTo: '/'
        //     });
    });

app.run(function($rootScope, Session, $location, $state) {

    function checkLoggedin(Session, $state) {
        if (Session.username) {
            return true;
        } else {
            return Session.refresh().then(function() {
                if (Session.username) {
                    return true;
                } else {
                    $state.go('login');
                }
            });
        }
    }

    $rootScope.Session = Session;

    $rootScope.$on('$stateChangeStart', function(){ 
        checkLoggedin(Session, $state);
    });

    $rootScope.logout = function() {
        Session.logout().then(function() {
            $state.go('login');
        });
    };
});