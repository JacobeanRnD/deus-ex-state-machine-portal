'use strict';

angular.module('deusExStateMachinePortalApp')
  .controller('DashboardOverviewCtrl', function ($scope, charts) {
    $scope.charts = charts.data.data.charts;
  });
