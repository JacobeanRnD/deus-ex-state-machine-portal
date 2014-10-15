'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:InstancesCtrl
 * @description
 * # InstancesCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('InstancesCtrl', function($scope, instances, chartName) {
        instances.data.forEach(function(id, i, arr) {
            arr[i] = {
                id: id
            };
        });

        $scope.instances = instances.data;
        $scope.chartName = chartName;
    });