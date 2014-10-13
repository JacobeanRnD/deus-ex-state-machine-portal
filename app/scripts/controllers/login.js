'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('LoginCtrl', function($location, $scope, Session) {
        $scope.doLogin = function(inputUsername, inputPassword) {
            // $event.preventDefault();
            
            Session.login(inputUsername, inputPassword).then(function() {
                $location.url('/');
            });
        };
    });