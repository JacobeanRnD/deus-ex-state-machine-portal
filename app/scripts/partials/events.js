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

        dataService.getSparkDevices(username).then(function (sparkDetails) {
            dataService.getConnectedSparkDevice(username, chartName, instanceId).then(function (deviceDetails) {
                $scope.devices = sparkDetails.data.devices;
                $scope.selectedDevice = sparkDetails.data.devices.filter(function(device) {
                    return device.id === deviceDetails.data.device.id;
                })[0];
            });
        });

        simulateService.events.subscribe(username, chartName, instanceId, function onEntry(eventName, e) {
            $scope.events.unshift(eventName + ' -> ' + e.data);

            simulateService.events.highlight(eventName, e.data);
        });

        $scope.connectDevice = function (selectedDevice, listeningEvents) {
            listeningEvents = listeningEvents.split(',');

            dataService.connectSparkDevice(username, selectedDevice, listeningEvents, chartName, instanceId).then(function () {
                alertify.success('"' + selectedDevice.name  + '" connected with instance.');
            });
        };

        $scope.sendEvent = function(eventname, eventdata) {
            $scope.events.unshift('event sent -> ' + eventname + (eventdata ? (' - ' + eventdata) : ''));
            dataService.sendEvent(username, chartName, instanceId, eventname, eventdata).then(function() {

            });
        };
    });