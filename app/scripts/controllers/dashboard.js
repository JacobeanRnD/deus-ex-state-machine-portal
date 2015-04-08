'use strict';

angular.module('deusExStateMachinePortalApp')
  .controller('DashboardOverviewCtrl', function ($scope, charts) {
    $scope.charts = charts.data.data.charts;
  });


angular.module('deusExStateMachinePortalApp')
  .controller('DashboardChartCtrl', function ($scope, $stateParams, chartContent, instances) {
    $scope.scxml = chartContent.data.data.scxml;
    $scope.instances = instances.map(function(instance) {
      return {
        id: instance.id,
        state: instance.snapshot[0][0],
        datamodel: instance.snapshot[3]
      };
    });

    var stats = {};
    instances.forEach(function(instance) {
      var state = instance.snapshot[0][0];
      stats[state] = (stats[state] || 0) + 1;
    });
    $scope.stats = stats;

    function renderStats() {
      $('#dashboardStats').text(JSON.stringify($scope.stats));
    }

    renderStats();
  });
