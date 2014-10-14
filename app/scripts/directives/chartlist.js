'use strict';

/**
 * @ngdoc directive
 * @name deusExStateMachinePortalApp.directive:chartlist
 * @description
 * # chartlist
 */
angular.module('deusExStateMachinePortalApp')
    .directive('chartlist', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: true,
            templateUrl: 'views/directive-chartlist.html',
            link: function postLink() {
                
            }
        };
    });