'use strict';

/**
 * @ngdoc service
 * @name deusExStateMachinePortalApp.simulateService
 * @description
 * # simulateService
 * Factory in the deusExStateMachinePortalApp.
 */
angular.module('deusExStateMachinePortalApp')
    .factory('simulateService', function($rootScope, dataService) {
        return {
            chartContent: '',
            update: function(content) {
                this.chartContent = content;
                this.draw();
            },
            draw: function() {
                $rootScope.$broadcast('simulationContentUploaded');
            },
            events: {
                subscribe: function(username, chartName, instanceId, callback) {
                    this.eventSource = dataService.subscribeInstance(username, chartName, instanceId);

                    this.eventSource.addEventListener('onEntry', function(e) {
                        callback('onEntry', e);
                    }, false);

                    this.eventSource.addEventListener('onExit', function(e) {
                        callback('onExit', e);
                    }, false);
                },
                highlight: function(eventName, event) {
                    if(Array.isArray(event)) {
                        for(var eventIndex in event) {
                            $rootScope.$broadcast('simulationHighlighted', eventName, event[eventIndex]);
                        }
                    } else {
                        $rootScope.$broadcast('simulationHighlighted', eventName, event);
                    }
                }
            }
        };
    });