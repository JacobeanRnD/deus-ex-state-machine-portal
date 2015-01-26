'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
  .controller('RegisterCtrl', function ($scope, $state, dataService) {
    $scope.doRegister = function (inputEmail, inputPassword) {
      dataService.createAccount(inputEmail, inputPassword).then(function () {
        alertify.success('Account created.');
        $state.go('login');
      }, function (error) {
        alertify.error(error.data);
      });
    };
  });

