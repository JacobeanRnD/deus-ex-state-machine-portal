'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:EventsCtrl
 * @description
 * # EventsCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('EventsCtrl', function($scope, dataService, simulateService, username, chartName, instanceId) {
        $scope.events = [];

        simulateService.events.subscribe(username, chartName, instanceId, function onEntry(eventName, e) {
            $scope.events.unshift(eventName + ' -> ' + e.data);

            simulateService.events.highlight(eventName, e.data);
        });
        
        $scope.sendEvent = function(eventname, eventdata) {
            $scope.events.unshift('event sent -> ' + eventname + (eventdata ?  (' - ' + eventdata) : ''));
            dataService.sendEvent(username, chartName, instanceId, eventname, eventdata).then(function() {
                
            });
        };


        // function selectInstance(instance) {
        //     closeInstanceSubscription();
        //     $scope.stateChart.instance = instance;
        //     $scope.stateChart.instance.events = [];

        //     var source = dataService.subscribeInstance($scope.stateChart.name, instance.id);
        //     if(source) {
        //         $scope.source = source;

        //         source.addEventListener('onEntry', function(e) {
        //             d3.select($('#scxmlTrace #' + e.data)[0]).classed('highlighted', true);
        //             $scope.stateChart.instance.events.push('onEntry -> ' + e.data);
        //         }, false);
        //         source.addEventListener('onExit', function(e) {
        //             d3.select($('#scxmlTrace #' + e.data)[0]).classed('highlighted', false);
        //             $scope.stateChart.instance.events.push('onExit -> ' + e.data);
        //         }, false);

        //         window.onbeforeunload = function(){
        //             closeInstanceSubscription();
        //         };
        //     }

        //     dataService.getInstanceDetails($scope.stateChart.name, instance.id).then(function(response) {
        //         d3.select($('#scxmlTrace #' + response.data[0])[0]).classed('highlighted', true);

        //         $scope.stateChart.instance.details = JSON.stringify(response.data[3], null, 4);
        //     });
        // }
    });