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
    $scope.doRegister = function (inputUsername, inputEmail, inputPassword) {
      dataService.createAccount(inputUsername, inputEmail, inputPassword).then(function () {
        alertify.success('Your account is on the wait list, pending for approval.');
        $scope.showWaitListMessage = true;
      }, function (error) {
        alertify.error(error.data.data || error.data);
      });
    };
  });

