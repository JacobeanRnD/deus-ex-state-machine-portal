'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:InstancedetailCtrl
 * @description
 * # InstancedetailCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('InstancedetailCtrl', function($scope, instanceDetails, instanceId) {
        $scope.instanceId = instanceId;
        $scope.dataModel = JSON.stringify(instanceDetails.data[3], null, 4);
    });