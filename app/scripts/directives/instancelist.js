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
            restrict: 'AE',
            replace: true,
            templateUrl: 'views/directive-instancelist.html',
            link: function postLink(scope, element, attrs) {
                element.text('this is the instancelist directive');
            }
        };
    });