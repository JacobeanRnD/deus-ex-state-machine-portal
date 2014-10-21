'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('EditorCtrl', function($scope, $state, simulateService, dataService, chartName, chartContent, username) {
        $scope.chartName = chartName;
        $scope.chartContent = chartContent.data;

        simulateService.update($scope.chartContent);

        $scope.aceChanged = function() {
            simulateService.update($scope.chartContent);
        };

        $scope.saveStatechart = function(content) {
            var isError = false;

            if (!content || content.length === 0) {
                isError = true;
                alertify.error('Please enter code for your Statechart');
            }

            if (isError) {
                return;
            }

            dataService.createStateChart(username, content).then(function() {
                $state.go('.', null, { reload: true });
                //TODO: select newly created chart

                alertify.success('Statechart saved');
            }, function(response) {
                if (response.data.message) {
                    alertify.error(response.data.message);
                } else {
                    alertify.error('An error occured');
                }
            });
        };

        
    });