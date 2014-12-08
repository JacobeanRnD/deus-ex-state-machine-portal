'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:ChannelsCtrl
 * @description
 * # ChannelsCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('ChannelsCtrl', function($location, $scope, Session, $state, dataService, username) {
        $scope.activate = function (channelname) {
        	if(channelname === 'twitter') {
        		//Start listening for child windows
        		window.channelListener = {
        			done: function (error, data) {
        				if(error) {
        					alertify.error(error);
        				} else {
        					dataService.saveChannelData(username, channelname, data).then(function() {
				                alertify.success(channelname + ' channel activated.');
				            });
        				}
        			}
        		};

        		window.open('/channels/twitter', '_blank');
        	}
        };
    });