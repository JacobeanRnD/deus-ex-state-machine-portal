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
    $scope.instances = instances.data.data.instances;

    $scope.chartName = chartName;

    $scope.createInstance = function () {
      dataService.createInstance().then(function (result) {
        var instanceId = result.data.data.id;

        //Just start as a convenience
        dataService.sendEvent(instanceId, 'system.start', null).then(function () {
          $state.go('main.charts.detail.instance', {
            instanceId: instanceId
          }, {
            reload: true
          });
          alertify.success('Instance created');
        });
      }, function (response) {
        if (response.data.data.message) {
          alertify.error(response.data.data.message);
        } else {
          alertify.error('An error occured');
        }
      });
    };

    $scope.deleteInstance = function (instance) {
      dataService.deleteInstance(instance.id).then(function () {
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

