'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
  .controller('LoginCtrl', function ($location, $scope, Session, $state) {
    $scope.doLogin = function (inputEmail, inputPassword) {
      Session.login(inputEmail, inputPassword, function (err) {
        if (err) {
          alertify.error(err.headers('WWW-Authenticate'));
          return;
        }

        alertify.success('Logged in.');
        $state.go('main.charts');
      });
    };
  });

