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
    $scope.charts = charts.data;

    $scope.deleteStateChart = function (chart) {
      dataService.deleteStateChart(username, chart.name).then(function () {
        $state.go('.', null, {
          reload: true
        });
        alertify.success('Statechart deleted');
      });
    };
  });

