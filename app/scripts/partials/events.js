'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:EventsCtrl
 * @description
 * # EventsCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
  .controller('EventsCtrl', function ($scope, dataService, simulateService, username, chartName, instanceId) {
    $scope.events = [];

    dataService.getSparkDevices(username).then(function (sparkDetails) {
      dataService.getConnectedSparkDevice(username, chartName, instanceId).then(function (deviceDetails) {
        $scope.devices = sparkDetails.data.devices;
        if (sparkDetails.data.devices && sparkDetails.data.devices.length > 0 && deviceDetails.data.device) {
          $scope.selectedDevice = sparkDetails.data.devices.filter(function (device) {
            return device.id === deviceDetails.data.device.id;
          })[0];
        }
      });
    });

    simulateService.events.subscribe(username, chartName, instanceId, function onEntry(eventName, e) {
      var today = new Date();
      var h = today.getHours();
      var m = today.getMinutes();
      var s = today.getSeconds();
      m = checkTime(m);
      s = checkTime(s);

      $scope.events.unshift(h + ':' + m + ':' + s + ': ' + eventName + ' -> ' + e.data);

      if ($scope.events.length > 50) {
        $scope.events.splice(50, 1);
      }

      simulateService.events.highlight(eventName, e.data);
    });

    $scope.connectDevice = function (selectedDevice, listeningEvents) {
      listeningEvents = listeningEvents.split(',');

      dataService.connectSparkDevice(username, selectedDevice, listeningEvents, chartName, instanceId).then(function () {
        alertify.success('"' + selectedDevice.name + '" connected with instance.');
      });
    };

    $scope.sendEvent = function (eventname, eventdata) {
      $scope.events.unshift('event sent -> ' + eventname + (eventdata ? (' - ' + eventdata) : ''));
      dataService.sendEvent(username, chartName, instanceId, eventname, eventdata).then(function () {

      });
    };

    function checkTime(i) {
      if (i < 10) {
        i = '0' + i;
      } // add zero in front of numbers < 10
      return i;
    }
  });

