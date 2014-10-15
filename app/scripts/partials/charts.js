'use strict';

/**
 * @ngdoc directive
 * @name deusExStateMachinePortalApp.directive:chartlist
 * @description
 * # chartlist
 */
angular.module('deusExStateMachinePortalApp')
    .directive('charts', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: true,
            templateUrl: 'views/partials/charts.html',
            link: function postLink() {
                
            }
        };
    });