'use strict';

/**
 * @ngdoc overview
 * @name deusExStateMachinePortalApp
 * @description
 * # deusExStateMachinePortalApp
 *
 * Main module of the application.
 */

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
    results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

var url = getParameterByName('simulationServer');
url = url[url.length - 1] === '/' ? url.substring(0, url.length - 1) : url;

window.simulationServerUrl = url ? url : 'http://simulation.scxml.io';

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
    function checkLoggedin(Session, $state) {
      return Session.refresh().then(function () {
        if (Session.username) {
          return Session.username;
        } else {
          $state.go('login');
          return;
        }
      });
    }

    $httpProvider.defaults.withCredentials = true;
    $urlRouterProvider.otherwise('/charts');

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
        url: '',
        views: {
          'chartlist': {
            templateUrl: 'views/partials/charts.html',
            controller: 'ChartsCtrl',
            resolve: {
              charts: function (dataService, username, $state) {
                if (!username) {
                  $state.go('login');
                  return;
                }

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
              chartName: function () {
                return 'New Statechart';
              },
              chartContent: function () {
                return {
                  data: '<?xml version="1.0" encoding="UTF-8"?>\n' +
                        '<scxml xmlns="http://www.w3.org/2005/07/scxml" name="helloworld" datamodel="ecmascript" version="1.0">\n' +
                        '  <state id="a">\n' +
                        '    <transition target="b" event="t"/>\n' +
                        '  </state>\n' +
                        '  <state id="b">\n' +
                        '    <transition target="c" event="t"/>\n' +
                        '  </state>\n' +
                        '  <state id="c">\n' +
                        '    <transition target="a" event="t"/>\n' +
                        '  </state>\n' +
                        '</scxml>'};
              }
            }
          },
          'simulation@main': {
            templateUrl: 'views/partials/simulation.html',
            controller: 'SimulationCtrl',
            resolve: {
              chartName: function () {
                return null;
              }
            }
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
              instances: function (dataService, username, $stateParams) {
                return dataService.getInstances(username, $stateParams.chartName);
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
                return dataService.getStateChart(username, $stateParams.chartName);
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
                return dataService.getInstanceDetails(username, $stateParams.chartName, $stateParams.instanceId);
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
      });
  });

app.run(function ($rootScope, Session, $location, $state) {
  $rootScope.state = $state;
  $rootScope.Session = Session;

  $rootScope.logout = function () {
    Session.logout().then(function () {
      $state.go('login');
    });
  };
});

