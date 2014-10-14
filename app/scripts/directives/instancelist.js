'use strict';

/**
 * @ngdoc directive
 * @name deusExStateMachinePortalApp.directive:instancelist
 * @description
 * # instancelist
 */
angular.module('deusExStateMachinePortalApp')
    .directive('instancelist', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directive-instancelist.html',
            link: function postLink() {
                
            }
        };
    });