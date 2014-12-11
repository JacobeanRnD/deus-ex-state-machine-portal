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
    		twitter: {
    			status: 'notactive'
    		},
    		spark: {
    			status: 'notactive'
    		}
    	};

        $scope.activate = function (channelname, accessToken) {
        	if(channelname === 'twitter') {
        		$scope.channels.twitter.status = 'loading';

        		//Start listening for child windows
        		window.channelListener = {
        			done: function (error, data) {
        				if(error) {
        					$scope.channels.twitter.status = 'notactive';
        					alertify.error(error);
        				} else {
							dataService.saveChannelData(username, channelname, data).then(function() {
								$scope.channels.twitter.status = 'success';
								alertify.success('"' + channelname  + '" channel activated.');
							});
        				}
        			}
        		};

        		window.open('/channels/twitter', '_blank');
        	} else if(channelname === 'spark') {
        		if(accessToken) {
        			dataService.getSparkDevicesOnSpark(accessToken).then(function(result) {
						dataService.saveSparkDevices(username, channelname, accessToken, result.data).then(function() {
							$scope.channels.spark.status = 'success';
							alertify.success('"' + channelname  + '" channel activated.');
						});
					});
        		} else {
        			window.open('https://www.spark.io/build/new', '_blank');
        			$scope.channels.spark.status = 'loading';
        		}
        		
        	}
        };
    });