'use strict';

/**
 * @ngdoc service
 * @name deusExStateMachinePortalApp.simulateService
 * @description
 * # simulateService
 * Factory in the deusExStateMachinePortalApp.
 */
angular.module('deusExStateMachinePortalApp')
    .factory('simulateService', function($rootScope) {
        return {
            chartContent: '',
            update: function(content) {
                this.chartContent = content;
                $rootScope.$broadcast('simulationContentUploaded');
            }
        };
    });


// d3.select($('#scxmlTrace #' + e.data)[0]).classed('highlighted', true);
//                     $scope.stateChart.instance.events.push('onEntry -> ' + e.data);