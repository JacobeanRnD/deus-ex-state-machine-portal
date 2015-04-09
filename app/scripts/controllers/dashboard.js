'use strict';

angular.module('deusExStateMachinePortalApp')
  .controller('DashboardOverviewCtrl', function ($scope, charts) {
    $scope.charts = charts;
  });


angular.module('deusExStateMachinePortalApp')
  .controller('DashboardChartCtrl', function ($scope, $stateParams, chartContent, instances, events) {
    $scope.scxml = chartContent;
    $scope.instances = instances;
    $scope.events = events;

    $('#dashboardInstances').DataTable({
      columns: [
        {data: 'id', title: 'ID'},
        {data: 'state', title: 'State'},
        {data: function(d) { return JSON.stringify(d.datamodel); }, title: 'Data'},
      ],
      data: $scope.instances
    }).columns().every(function() {
      var $input = $('<input type=search>');
      $input.appendTo($('<th>').appendTo('#dashboardInstances tfoot'));
      $input.on('keyup change', function() {
        this.search($input.val()).draw();
      }.bind(this));
    });

    $('#dashboardEventLog').DataTable({
      columns: [
        {data: 'instance', title: 'Instance'},
        {data: 'name', title: 'Name'},
        {data: 'origin', title: 'Origin'},
        {data: 'target', title: 'Target'},
        {data: function(d) { return JSON.stringify(d.data); }, title: 'Data'},
        {data: function(d) { return window.moment(d.timestamp).calendar(); }, title: 'Time'}
      ],
      data: $scope.events
    }).columns().every(function() {
      var $input = $('<input type=search>');
      $input.appendTo($('<th>').appendTo('#dashboardEventLog tfoot'));
      $input.on('keyup change', function() {
        this.search($input.val()).draw();
      }.bind(this));
    });

    var stats = {};
    instances.forEach(function(instance) {
      stats[instance.state] = (stats[instance.state] || 0) + 1;
    });
    $scope.stats = stats;

    function renderStats() {
      var data = d3.entries($scope.stats).sort();
      var total = d3.sum(data, function(d) { return d.value; });
      var height = 20 + data.length * 30;

      var svg = d3.select('#dashboardStats').append('svg')
          .attr('width', 600)
          .attr('height', height);

      var stats = svg.selectAll('.stat')
          .data(data)
        .enter().append('g')
          .attr('class', 'stat')
          .attr('transform',
            function(d, i) { return 'translate(30,' + (10+30*i) + ')'; });

      stats.append('rect')
          .attr('height', 20)
          .attr('width', function(d) { return 100 * d.value / total; })
          .attr('x', function(d) { return 100 - 100 * d.value / total; });

      stats.append('text')
          .attr('dx', 110)
          .attr('dy', 15)
          .attr('style', 'font-size: 20px')
          .text(function(d) { return d.key; });
    }

    renderStats();
  });


angular.module('deusExStateMachinePortalApp')
  .controller('DashboardInstanceCtrl', function ($scope, $stateParams, chartContent, instance, events) {
    $scope.scxml = chartContent;
    $scope.instance = instance;
    $scope.events = events;

    var layout = new window.forceLayout.Layout({
      parent: $('#dashboardVisualization').css({height: 200})[0],
      doc: (new DOMParser()).parseFromString($scope.scxml, 'application/xml')
    });
    layout.initialized
      .then(function() {
        layout.fit();
        layout.highlightState($scope.instance.state, true);
      })
      .done();

    $('#dashboardEventLog').DataTable({
      columns: [
        {data: 'name', title: 'Name'},
        {data: 'origin', title: 'Origin'},
        {data: 'target', title: 'Target'},
        {data: function(d) { return JSON.stringify(d.data); }, title: 'Data'},
        {data: function(d) { return window.moment(d.timestamp).calendar(); }, title: 'Time'}
      ],
      data: $scope.events
    }).columns().every(function() {
      var $input = $('<input type=search>');
      $input.appendTo($('<th>').appendTo('#dashboardEventLog tfoot'));
      $input.on('keyup change', function() {
        this.search($input.val()).draw();
      }.bind(this));
    });
  });
