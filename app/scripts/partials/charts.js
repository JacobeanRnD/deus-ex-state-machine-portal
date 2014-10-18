'use strict';

/**
 * @ngdoc directive
 * @name deusExStateMachinePortalApp.controller:charts
 * @description
 * # charts
 */
angular.module('deusExStateMachinePortalApp')
    .controller('ChartsCtrl', function($scope, $state, dataService, charts) {
        charts.data.forEach(function(name, i, arr) {
            arr[i] = {
                name: name
            };
        });

        $scope.charts = charts.data;

        $scope.deleteStateChart = function(chart) {
            // closeInstanceSubscription();

            dataService.deleteStateChart(chart.name).then(function() {
                $state.go('/');
                alertify.success('Statechart deleted');
            });
        };
    });