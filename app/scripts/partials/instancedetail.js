'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:InstancedetailCtrl
 * @description
 * # InstancedetailCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('InstancedetailCtrl', function($scope, $timeout, username, simulateService, dataService, instanceDetails, instanceId, chartName) {
        $scope.chartName = chartName;
        $scope.instanceId = instanceId;
        $scope.dataModel = JSON.stringify(instanceDetails.data[3], null, 4);

        //Redraw to remove event changes
        simulateService.draw();

        //Wait till everything is loaded so the event listener on simulation controller can bind
        $timeout(function() {
            simulateService.events.highlight('onEntry', instanceDetails.data[0]);
        });

        $scope.oneSecondPassed = true;
        $scope.$on('simulationHighlighted', function(e, eventName, event) {
            if(event[0] !== '[') {
                event = '["' + event + '"]';
            }

            $scope.currentChartState = event;

            dataService.getInstanceDetails(username, chartName, instanceId).then(function (instance) {
                // if(!_.isEqual($scope.prev, instance.data[3])) {// jshint ignore:line
                //     $scope.prev = instance.data[3];

                    $scope.dataModel = JSON.stringify(instance.data[3], null, 4);

                    if($scope.oneSecondPassed) {
                        addDataToDashboard(instance.data[3]);  
                        $scope.oneSecondPassed = false;
                        $timeout(function () {
                            $scope.oneSecondPassed = true;
                        }, 500);  
                    }

                // }
            });
        });

        function addDataToDashboard(data) {
            for(var serie in $scope.dashOptions.series) {
                if(data[$scope.dashOptions.series[serie].name]) {
                    $scope.dashOptions.series[serie].data.push([new Date().getTime(), parseInt(data[$scope.dashOptions.series[serie].name])]);

                    if($scope.dashOptions.series[serie].data.length > 30) {
                        $scope.dashOptions.series[serie].data.splice(0, 1);
                    }
                }
            }
        }
        
        var dataModelLegend = [];

        for(var item in instanceDetails.data[3]) {
            dataModelLegend.push({
                name: item,
                data: [],
                connectNulls: true,
                id: item,
                type: 'spline',
                dashStyle: 'Solid'
            });
        }
        
        $scope.dashOptions = {
            options: {
                chart: {
                    type: 'line',
                    animation: Highcharts.svg// jshint ignore:line
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