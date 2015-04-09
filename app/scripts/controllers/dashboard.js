'use strict';

angular.module('deusExStateMachinePortalApp')
  .controller('DashboardOverviewCtrl', function ($scope, charts) {
    $scope.charts = charts.data.data.charts;
  });


angular.module('deusExStateMachinePortalApp')
  .controller('DashboardChartCtrl', function ($scope, $stateParams, chartContent, instances, events) {
    $scope.scxml = chartContent.data.data.scxml;
    $scope.instances = instances.map(function(instance) {
      return {
        id: instance.id,
        state: instance.snapshot[0][0],
        datamodel: instance.snapshot[3]
      };
    });
    $scope.events = events;

    $('#dashboardEventLog').dataTable({
      columns: [
        {data: 'instance', title: 'Instance'},
        {data: 'name', title: 'Name'},
        {data: 'origin', title: 'Origin'},
        {data: 'target', title: 'Target'},
        {data: function(d) { return JSON.stringify(d.data); }, title: 'Data'},
        {data: function(d) { return window.moment(d.timestamp).calendar(); }, title: 'Time'}
      ],
      data: $scope.events
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
