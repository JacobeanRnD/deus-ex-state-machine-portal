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
        $urlRouterProvider.otherwise('/charts');

        // Now set up the states
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .state('main', {
                url: '/charts',
                abstract: true,
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .state('main.charts', {
                url: '',
                views: {
                    'chartlist': {
                        templateUrl: 'views/partials/charts.html',
                        controller: 'ChartsCtrl',
                        resolve: {
                            charts: function(dataService) {
                                return dataService.getAllStateCharts().then(function(response) {
                                    return response;
                                });
                            }
                        }
                    }
                }
            })
            .state('main.charts.new', {
                url: '^/new-chart',
                views: {
                    'editor@main': {
                        templateUrl: 'views/partials/editor.html',
                        controller: 'EditorCtrl',
                        resolve: {
                            chartName: function() {
                                return 'New Statechart';
                            },
                            chartContent: function() {
                                return '<scxml name="helloworld">\n' +
                                    '   <state id="a">\n' +
                                    '       <transition target="b" event="e1"/>\n' +
                                    '   </state>\n' +
                                    '   <state id="b"/>\n' +
                                    '</scxml>';
                            }
                        }
                    },
                    'simulation@main': {
                        templateUrl: 'views/partials/simulation.html',
                        controller: 'SimulationCtrl'
                    }
                }
            })
            .state('main.charts.detail', {
                url: '/:chartName/instances',
                views: {
                    'instancelist@main': {
                        templateUrl: 'views/partials/instances.html',
                        controller: 'InstancesCtrl',
                        resolve: {
                            instances: function(dataService, $stateParams) {
                                return dataService.getInstances($stateParams.chartName).then(function(response) {
                                    return response;
                                });
                            },
                            chartName: function($stateParams) {
                                return $stateParams.chartName;
                            }
                        }
                    },
                    'editor@main': {
                        templateUrl: 'views/partials/editor.html',
                        controller: 'EditorCtrl',
                        resolve: {
                            chartName: function($stateParams) {
                                return $stateParams.chartName;
                            },
                            chartContent: function(dataService, $stateParams) {
                                return dataService.getStateChart($stateParams.chartName).then(function(response) {
                                    return response.data;
                                });
                            }
                        }
                    },
                    'simulation@main': {
                        templateUrl: 'views/partials/simulation.html',
                        controller: 'SimulationCtrl'
                    }
                    // ,
                    // 'instancedetail@main': {
                    //     templateUrl: 'views/partials/instancedetail.html',
                    //     controller: 'InstancedetailCtrl'
                    // },
                    // 'events@main': {
                    //     templateUrl: 'views/partials/events.html',
                    //     controller: 'EventsCtrl'
                    // }
                }
            })
            // .state('main.charts.detail.instance', {
            //     url: '/:instanceId',
            //     template: 'asda'
            // })
        ;

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
    $rootScope.state = $state;

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

    $rootScope.$on('$stateChangeStart', function() {
        checkLoggedin(Session, $state);
    });

    $rootScope.logout = function() {
        Session.logout().then(function() {
            $state.go('login');
        });
    };
});