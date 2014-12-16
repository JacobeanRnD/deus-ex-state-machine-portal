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

        $scope.$on('simulationHighlighted', function(e, eventName, event) {
            if(event[0] !== '[') {
                event = '["' + event + '"]';
            }

            $scope.currentChartState = event;

            dataService.getInstanceDetails(username, chartName, instanceId).then(function (instance) {
                $scope.dataModel = JSON.stringify(instance.data[3], null, 4);
                addDataToDashboard(instance.data[3]);
            });
        });

        function addDataToDashboard (data) {
            var newData = data;
            newData.x = $scope.dashData ? $scope.dashData.length : 0;
            // newData.x = Date.now();

            if($scope.dashData) {
                $scope.dashData.push(newData);
            } else {
                $scope.dashData = [ newData ];
            }
        }
        
        // addDataToDashboard(instanceDetails.data[3]);

        $scope.dashOptions = {
            axes: {
                x: { key: 'x' },
                y: { type: 'linear' }
            },
            series: [{
                y: 'some1',
                axis: 'y',
                type: 'line'
            }, {
                y: 'some2',
                type: 'line',
                axis: 'y'
            }, {
                y: 'some3',
                type: 'line',
                axis: 'y'
            }, {
                y: 'some4',
                type: 'line',
                axis: 'y',
                id: 'some4'
            }],
            stacks: [],
            lineMode: 'linear',
            tension: 0,
            tooltip: { mode: 'scrubber' },
            drawLegend: true,
            drawDots: true,
            columnsHGap: 5
        };
    });