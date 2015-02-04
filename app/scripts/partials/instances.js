'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:InstancesCtrl
 * @description
 * # InstancesCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
  .controller('InstancesCtrl', function ($scope, $state, dataService, instances, chartName, username) {
    $scope.instances = instances.data.data;
    $scope.chartName = chartName;

    $scope.createInstance = function () {
      dataService.createInstance(username, chartName).then(function (result) {
        $state.go('main.charts.detail.instance', {
          instanceId: result.data.id
        }, {
          reload: true
        });
        alertify.success('Instance created');
      }, function (response) {
        if (response.data.message) {
          alertify.error(response.data.message);
        } else {
          alertify.error('An error occured');
        }
      });
    };

    $scope.deleteInstance = function (instance) {
      dataService.deleteInstance(username, chartName, instance.id).then(function () {
        if (instance.id === $state.params.instanceId) {
          $state.go('main.charts.detail', {
            chartName: chartName
          }, {
            reload: true
          });
        } else {
          $state.go('.', null, {
            reload: true 
          });
        }

        alertify.success('Instance deleted');
      });
    };
  });

