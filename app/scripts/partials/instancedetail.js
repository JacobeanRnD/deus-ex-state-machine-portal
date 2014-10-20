'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:InstancedetailCtrl
 * @description
 * # InstancedetailCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('InstancedetailCtrl', function($scope, $timeout, simulateService, instanceDetails, instanceId, chartName) {
        $scope.chartName = chartName;
        $scope.instanceId = instanceId;
        $scope.dataModel = JSON.stringify(instanceDetails.data[3], null, 4);

        //Redraw to remove event changes
        simulateService.draw();

        //Wait till everything is loaded so the event listener on simulation controller can bind
        $timeout(function(){
            simulateService.events.highlight('onEntry', instanceDetails.data[0]);
        }); 
    });