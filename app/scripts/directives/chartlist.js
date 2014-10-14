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
            restrict: 'AE',
            replace: true,
            templateUrl: 'views/directive-chartlist.html',
            link: function postLink(scope, element, attrs) {
                element.text('this is the chartlist directive');
            }
        };
    });