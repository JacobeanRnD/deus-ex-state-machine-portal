'use strict';

angular.module('deusExStateMachinePortalApp')
  .controller('DashboardOverviewCtrl', function ($scope, charts) {
    $scope.charts = charts;
  });


angular.module('deusExStateMachinePortalApp')
  .controller('DashboardChartCtrl', function ($scope, $state, $stateParams, chartContent, instances, events) {
    $scope.chart = $stateParams.chartName;
    $scope.scxml = chartContent;
    $scope.instances = instances;
    $scope.events = events.map(function(item) {
      return {
        instance: item.instanceid.split('/')[1],
        name: item.event.name,
        target: item.snapshot[0],
        data: JSON.stringify(item.event.data),
        timestamp: item.created
      };
    });

    $('#dashboardInstances').DataTable({
      columns: [
        {data: 'id', title: 'ID', render: function(d) { return '<a class="dashboardInstanceLink" data-instanceid="' + d + '">' + d + '</a>'; }},
        {data: 'state', title: 'State'},
        {data: function(d) { return JSON.stringify(d.datamodel); }, title: 'Data'},
      ],
      data: $scope.instances
    }).columns().every(function() {
      var $input = $('<input type="search" class="form-control" placeholder="search">');
      $input.appendTo($('<th>').appendTo('#dashboardInstances tfoot'));
      $input.on('keyup change', function() {
        this.search($input.val()).draw();
      }.bind(this));
    });

    $('#dashboardEventLog').DataTable({
      columns: [
        {data: 'instance', title: 'Instance', render: function(d) { return '<a class="dashboardInstanceLink" data-instanceid="' + d + '">' + d + '</a>'; }},
        {data: 'name', title: 'Name'},
        {data: 'target', title: 'Target'},
        {data: 'data', title: 'Data'},
        {data: function(d) { return window.moment(d.timestamp).calendar(); }, title: 'Time'}
      ],
      data: $scope.events
    }).columns().every(function() {
      var $input = $('<input type="search" class="form-control" placeholder="search">');
      $input.appendTo($('<th>').appendTo('#dashboardEventLog tfoot'));
      $input.on('keyup change', function() {
        this.search($input.val()).draw();
      }.bind(this));
    });

    $('.dataTables_filter input').addClass('form-control');

    $('#dashboardChart').on('click', '.dashboardInstanceLink', function(evt) {
      evt.preventDefault();
      $state.go('dashboardInstance', {
        chartName: $stateParams.chartName,
        instanceId: $(evt.target).data('instanceid')
      });
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
    $scope.chart = $stateParams.chartName;
    $scope.scxml = chartContent;
    $scope.instance = instance;
    $scope.events = events.map(function(item) {
      return {
        name: item.event.name,
        target: item.snapshot[0],
        data: JSON.stringify(item.event.data),
        timestamp: item.created
      };
    });

    var layout = new window.forceLayout.Layout({
      parent: $('#dashboardVisualization').css({height: 200})[0],
      doc: (new DOMParser()).parseFromString($scope.scxml, 'application/xml')
    });

    var highlight = function(state) {
      layout.unhighlightAllStates();
      layout.highlightState(state, true);
    };

    layout.initialized
      .then(function() {
        layout.fit();
        highlight($scope.instance.state);
      })
      .done();

    $('#dashboardEventLog').DataTable({
      columns: [
        {data: 'name', title: 'Name'},
        {data: 'target', title: 'Target'},
        {data: 'data', title: 'Data'},
        {data: 'timestamp', title: 'Time'}
      ],
      data: $scope.events,
      order: [[3, 'desc']]
    }).columns().every(function() {
      var $input = $('<input type=search>');
      $input.appendTo($('<th>').appendTo('#dashboardEventLog tfoot'));
      $input.on('keyup change', function() {
        this.search($input.val()).draw();
      }.bind(this));
    });

    var select = function(tr) {
      $('#dashboardEventLog tbody tr.selected').removeClass('selected');
      $(tr).addClass('selected');
      highlight($('td', tr).eq(1).text());
    };

    $('#dashboardEventLog tbody').on('click', 'tr', function() {
      select(this);
    });
    select($('#dashboardEventLog tbody tr')[0]);
  });
