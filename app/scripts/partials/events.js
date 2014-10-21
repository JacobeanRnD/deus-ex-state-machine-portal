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
            $scope.events.unshift('event sent -> ' + eventname + (eventdata ? (' - ' + eventdata) : ''));
            dataService.sendEvent(username, chartName, instanceId, eventname, eventdata).then(function() {

            });
        };
    });