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
    	$scope.channels = {
    		twitter: 'notactive',
    		spark: 'notactive'
    	};

        $scope.activate = function (channelname) {
        	if(channelname === 'twitter') {
        		$scope.channels.twitter = 'loading';

        		//Start listening for child windows
        		window.channelListener = {
        			done: function (error, data) {
        				if(error) {
        					$scope.channels.twitter = 'notactive';
        					alertify.error(error);
        				} else {
							dataService.saveChannelData(username, channelname, data).then(function() {
								$scope.channels.twitter = 'success';
								alertify.success('"' + channelname  + '" channel activated.');
							});
        				}
        			}
        		};

        		window.open('/channels/twitter', '_blank');
        	} else if(channelname === 'spark') {
        		
        	}
        };
    });