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
    $scope.doLogin = function (inputUsername, inputPassword) {
      Session.login(inputUsername, inputPassword, function (err) {
        if (err) {
          alertify.error(err.data);
          return;
        }

        alertify.success('Logged in.');
        $state.go('main.charts');
      });
    };
  });

