'use strict';

/**
 * @ngdoc directive
 * @name deusExStateMachinePortalApp.controller:charts
 * @description
 * # charts
 */
angular.module('deusExStateMachinePortalApp')
  .controller('ChartsCtrl', function ($scope, $state, dataService, charts, username) {
    $scope.username = username;
    $scope.charts = charts.data.charts;

    $scope.deleteStateChart = function (chart) {
      dataService.deleteStateChart(username, chart).then(function () {

        if (chart === $state.params.chartName) {
          $state.go('main.charts', {}, {
            reload: true
          });
        } else {
          $state.go('.', null, {
            reload: true
          });
        }

        alertify.success('Statechart deleted');
      });
    };
  });

