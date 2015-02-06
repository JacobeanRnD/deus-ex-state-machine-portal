'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
  .controller('ProfileCtrl', function ($rootScope, $timeout, $location, $scope, Session, $state, dataService, username, token) {
    $scope.token = token.data.data;

    $scope.getToken = function () {
      dataService.refreshToken(username).then(function () {
        $state.go('.', null, {
          reload: true 
        });
      });
    };
  });

