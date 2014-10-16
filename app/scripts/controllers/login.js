'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('LoginCtrl', function($location, $scope, Session, $state) {
        $scope.doLogin = function(inputUsername, inputPassword) {
            Session.login(inputUsername, inputPassword).then(function() {
                $state.go('main');
            });
        };
    });