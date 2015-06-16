'use strict';

/**
 * @ngdoc overview
 * @name deusExStateMachinePortalApp
 * @description
 * # deusExStateMachinePortalApp
 *
 * Main module of the application.
 */

window.simulationServerUrl = window.location.href.split(/#/)[0].replace(/\/$/, '');
window.isSCXMLD = true;

var app = angular.module('deusExStateMachinePortalApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.ace',
    'ui.router',
    'highcharts-ng'
  ])
  .config(function ($routeProvider, $stateProvider, $urlRouterProvider, $httpProvider) {
    function checkLoggedin() {
      return 'root';
    }

    if(!window.isSCXMLD)
      $httpProvider.defaults.withCredentials = true;
    
    $urlRouterProvider.otherwise('/charts/default/instances');

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        resolve: {
          emailtoken: function () {
            return null;
          }
        }
      })
      .state('verify', {
        url: '/verify/:emailtoken',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        resolve: {
          emailtoken: function ($stateParams) {
            return $stateParams.emailtoken;
          }
        }
      })
      .state('register', {
        url: '/register',
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl',
        resolve: {
          username: checkLoggedin,
          token: function (dataService, username) {
            return dataService.getToken(username);
          }
        }
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
        url: ''
      })
      .state('main.charts.detail', {
        url: '/:chartName/instances',
        views: {
          'instancelist@main': {
            templateUrl: 'views/partials/instances.html',
            controller: 'InstancesCtrl',
            resolve: {
              instances: function (dataService, username, $stateParams, $q) {
                return dataService.getInstances()
                  .then(function(req) {
                    return {
                      data : {
                        data : {
                          instances : req.data.data.instances.map(function(instance) {
                            return { id : instance };
                          })
                        }
                      }
                    }
                  });
              },
              chartName: function ($stateParams) {
                return $stateParams.chartName;
              }
            }
          },
          'editor@main': {
            templateUrl: 'views/partials/editor.html',
            controller: 'EditorCtrl',
            resolve: {
              chartName: function ($stateParams) {
                return $stateParams.chartName;
              },
              chartContent: function (dataService, username, $stateParams) {
                return dataService.getStateChart();
              }
            }
          },
          'simulation@main': {
            templateUrl: 'views/partials/simulation.html',
            controller: 'SimulationCtrl',
            resolve: {
              chartName: function ($stateParams) {
                return $stateParams.chartName;
              }
            }
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
              chartName: function ($stateParams) {
                return $stateParams.chartName;
              },
              instanceDetails: function (dataService, username, $stateParams) {
                return dataService.getInstanceDetails($stateParams.instanceId);
              },
              instanceId: function ($stateParams) {
                return $stateParams.instanceId;
              },
              username: checkLoggedin
            }
          },
          'events@main': {
            templateUrl: 'views/partials/events.html',
            controller: 'EventsCtrl',
            resolve: {
              chartName: function ($stateParams) {
                return $stateParams.chartName;
              },
              instanceId: function ($stateParams) {
                return $stateParams.instanceId;
              }
            }
          }
        },
        onEnter: function (simulateService) {
          window.onbeforeunload = function () {
            if (simulateService.events.eventSource) {
              simulateService.events.eventSource.close();
            }
          };
        },
        onExit: function (simulateService) {
          if (simulateService.events.eventSource) {
            simulateService.events.eventSource.close();
          }
        }
      })
      .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardOverviewCtrl',
        resolve: {
          charts: function() {
            return ['default'];
          }
        }
      })
      .state('dashboardChart', {
        url: '/dashboard/:chartName',
        templateUrl: 'views/dashboardChart.html',
        controller: 'DashboardChartCtrl',
        resolve: {
          username: checkLoggedin,
          chartContent: function (dataService, username, $stateParams) {
            return dataService
              .getStateChart()
              .then(function(req) {
                return req.data;
              });
          },
          instances: function (dataService, username, $stateParams, $q) {
            return dataService
              .getInstances()
              .then(function(req) {
                debugger;
                return $q.all(req.data.data.instances.map(function(instance) {
                  return dataService
                    .getInstanceDetails(instance.id)
                    .then(function(req) {
                      return {
                        id: instance.id,
                        state: req.data.data.instance.snapshot[0],
                        datamodel: req.data.data.instance.snapshot[3]
                      };
                    });
                }));
              });
          },
          events: function (dataService, username, $stateParams, instances, $q) {
            return $q.all(instances.map(function(instance) {
              return dataService
                .getInstanceEvents(instance.id)
                .then(function(req) {
                  var events = req.data.data.events;
                  events.forEach(function(e) {
                    e.instanceid = instance.id;
                  });
                  return events;
                });
            }))
              .then(function(nestedEventList) {
                var eventList = [].concat.apply([], nestedEventList);
                return eventList.sort(function(a, b) {
                  return window.d3.descending(a.created, b.created);
                });
              });
          }
        }
      })
      .state('dashboardInstance', {
        url: '/dashboard/:chartName/:instanceId',
        templateUrl: 'views/dashboardInstance.html',
        controller: 'DashboardInstanceCtrl',
        resolve: {
          username: checkLoggedin,
          chartContent: function (dataService, username, $stateParams) {
            return dataService
              .getStateChart()
              .then(function(req) {
                return req.data;
              });
          },
          instance: function(dataService, username, $stateParams) {
            return dataService
              .getInstanceDetails($stateParams.instanceId)
              .then(function(req) {
                return {
                  id: $stateParams.instanceId,
                  state: req.data.data.instance.snapshot[0],
                  datamodel: req.data.data.instance.snapshot[3]
                };
              });
          },
          events: function(dataService, username, $stateParams) {
            return dataService
              .getInstanceEvents($stateParams.instanceId)
              .then(function(req) {
                return req.data.data.events;
              });
          }
        }
      });
  });

app.run(function ($rootScope, Session, $location, $state) {
  $rootScope.state = $state;
  $rootScope.Session = Session;
  $rootScope.isSCXMLD = window.isSCXMLD;

  $rootScope.logout = function () {
    Session.logout().then(function () {
      $state.go('login');
    });
  };
});

