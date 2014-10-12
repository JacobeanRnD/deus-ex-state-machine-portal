'use strict';

/**
 * @ngdoc overview
 * @name deusExStateMachinePortalApp
 * @description
 * # deusExStateMachinePortalApp
 *
 * Main module of the application.
 */
angular
  .module('deusExStateMachinePortalApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    
    function checkLoggedin (Session, $location){// jshint ignore:line
        return true;

      // // Initialize a new promise var deferred = $q.defer(); 
      // if(Session.userCtx && Session.userCtx.name){
      //   return true;
      // }else{
      //   return Session.refresh().then(function(){
      //     if(Session.userCtx && Session.userCtx.name){
      //       return true;
      //     }else{
      //       $location.url('/login');
      //     }
      //   });
      // }
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
        resolve: { loggedin: checkLoggedin }
      })
      .otherwise({
        redirectTo: '/'
      });
  });
