'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:EventsCtrl
 * @description
 * # EventsCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('EventsCtrl', function($scope, dataService, username, chartName, instanceId) {
        $scope.events = [];
        
        $scope.sendEvent = function(eventname, eventdata) {
            dataService.sendEvent(username, chartName, instanceId, eventname, eventdata).then(function() {
                $scope.events.push('event sent -> ' + eventname + (eventdata ?  (' - ' + eventdata) : ''));
            });
        };
    });