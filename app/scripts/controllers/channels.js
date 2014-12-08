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
        		//Start listening for child windows
        		window.channelListener = {
        			done: function (result) {
        				console.log(result);
        			}
        		};

        		window.open('/channels/twitter', '_blank');
        	}
        };
    });