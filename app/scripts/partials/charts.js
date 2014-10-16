'use strict';

/**
 * @ngdoc directive
 * @name deusExStateMachinePortalApp.controller:charts
 * @description
 * # charts
 */
angular.module('deusExStateMachinePortalApp')
    .controller('ChartsCtrl', function($scope, charts) {
        charts.data.forEach(function(name, i, arr) {
            arr[i] = {
                name: name
            };
        });

        $scope.charts = charts.data;
    });