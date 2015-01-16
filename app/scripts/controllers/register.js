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
    $scope.doRegister = function (inputUsername, inputPassword) {
      dataService.createAccount(inputUsername, inputPassword).then(function () {
        alertify.success('Account created.');
        $state.go('login');
      }, function (error) {
        alertify.error(error.data);
      });
    };
  });

