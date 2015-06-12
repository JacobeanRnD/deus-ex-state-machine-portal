'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:InstancedetailCtrl
 * @description
 * # InstancedetailCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
  .controller('InstancedetailCtrl', function ($scope, $timeout, username, simulateService, dataService, instanceDetails, instanceId, chartName) {
    var instance = instanceDetails.data.data.instance;

    var snapshot = instance.snapshot;
    $scope.chartName = chartName;
    $scope.instanceId = instanceId;
    $scope.dataModel = snapshot && JSON.stringify(snapshot[3], null, 4);
    $scope.currentChartState = [];

    //Redraw to remove event changes
    simulateService.draw();

    //Wait till everything is loaded so the event listener on simulation controller can bind
    $timeout(function () {
      simulateService.events.highlight('onEntry', instance.snapshot[0]);
    }, 1000);

    $scope.oneSecondPassed = true;
    $scope.$on('simulationHighlighted', function (e, eventName, event) {
      var stateIndex = $scope.currentChartState.indexOf(event);

      if (eventName === 'onEntry' && stateIndex === -1) {
        $scope.currentChartState.push(event);
      } else if (stateIndex !== -1) {
        $scope.currentChartState.splice(stateIndex, 1);
      }

      dataService.getInstanceDetails(instanceId).then(function (instance) {
        var dataModel = instance.data.data.instance.snapshot[3];

        $scope.dataModel = JSON.stringify(dataModel, null, 4);
        addDataToDashboard(dataModel);
      });
    });

    function addDataToDashboard(data) {
      for (var serie in $scope.dashOptions.series) {
        if (data[$scope.dashOptions.series[serie].name]) {
          $scope.dashOptions.series[serie].data.push([new Date().getTime(), parseInt(data[$scope.dashOptions.series[serie].name])]);

          if ($scope.dashOptions.series[serie].data.length > 10) {
            $scope.dashOptions.series[serie].data.splice(0, 1);
          }
        }
      }
    }

    var dataModelLegend = [];

    if(snapshot){
      for (var item in snapshot[3]) {
        dataModelLegend.push({
          name: item,
          data: [],
          connectNulls: true,
          id: item,
          type: 'spline',
          dashStyle: 'Solid'
        });
      }
    }

    $scope.dashOptions = {
      options: {
        chart: {
          type: 'line',
          animation: Highcharts.svg // jshint ignore:line
        }
      },
      xAxis: {
        type: 'datetime',
        tickInterval: 1000
      },
      series: dataModelLegend,
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      loading: false,
      size: {
        height: '300'
      }
    };
  });

