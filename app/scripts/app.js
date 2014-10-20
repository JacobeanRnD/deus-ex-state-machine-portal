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
        function checkLoggedin(Session, $state) {
            return Session.refresh().then(function() {
                if (Session.username) {
                    return Session.username;
                } else {
                    $state.go('login');
                    return false;
                }
            });
        }

        $urlRouterProvider.otherwise('/charts');

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
                controller: 'MainCtrl',
                resolve: {
                    username: checkLoggedin
                }
            })
            .state('main.charts', {
                url: '',
                views: {
                    'chartlist': {
                        templateUrl: 'views/partials/charts.html',
                        controller: 'ChartsCtrl',
                        resolve: {
                            charts: function(dataService, username) {
                                return dataService.getAllStateCharts(username);
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
                                return {
                                    data: '<scxml name="helloworld">\n' +
                                        '   <state id="a">\n' +
                                        '       <transition target="b" event="e1"/>\n' +
                                        '   </state>\n' +
                                        '   <state id="b"/>\n' +
                                        '</scxml>'
                                };
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
                            instances: function(dataService, username, $stateParams) {
                                return dataService.getInstances(username, $stateParams.chartName);
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
                            chartContent: function(dataService, username, $stateParams) {
                                return dataService.getStateChart(username, $stateParams.chartName);
                            }
                        }
                    },
                    'simulation@main': {
                        templateUrl: 'views/partials/simulation.html',
                        controller: 'SimulationCtrl'
                    }
                }
            })
            .state('main.charts.detail.instance', {
                url: '/:instanceId',
                views: {
                    'instancedetail@main': {
                        templateUrl: 'views/partials/instancedetail.html',
                        controller: 'InstancedetailCtrl',
                        resolve: {
                            chartName: function($stateParams) {
                                return $stateParams.chartName;
                            },
                            instanceDetails: function(dataService, username, $stateParams) {
                                return dataService.getInstanceDetails(username, $stateParams.chartName, $stateParams.instanceId);
                            },
                            instanceId: function($stateParams) {
                                return $stateParams.instanceId;
                            }
                        }
                    },
                    'events@main': {
                        templateUrl: 'views/partials/events.html',
                        controller: 'EventsCtrl',
                        resolve: {
                            chartName: function($stateParams) {
                                return $stateParams.chartName;
                            },
                            instanceId: function($stateParams) {
                                return $stateParams.instanceId;
                            }
                        }
                    }
                },
                onEnter: function(simulateService) {
                    window.onbeforeunload = function() {
                        if (simulateService.events.eventSource) {
                            simulateService.events.eventSource.close();
                        }
                    };
                },
                onExit: function(simulateService) {
                    if (simulateService.events.eventSource) {
                        simulateService.events.eventSource.close();
                    }
                }
            });
    });

app.run(function($rootScope, Session, $location, $state) {
    $rootScope.state = $state;
    $rootScope.Session = Session;

    $rootScope.logout = function() {
        Session.logout().then(function() {
            $state.go('login');
        });
    };
});