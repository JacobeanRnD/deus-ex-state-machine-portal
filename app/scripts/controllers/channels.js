'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:ChannelsCtrl
 * @description
 * # ChannelsCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('ChannelsCtrl', function($location, $scope, Session, $state) {
        $scope.activate = function (name) {
        	if(name === 'twitter') {
        		var twitterWindow = window.open('/channels/twitter', '_blank');
        	}
        };
    });