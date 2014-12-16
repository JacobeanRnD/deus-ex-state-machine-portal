'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:ChannelsCtrl
 * @description
 * # ChannelsCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('ChannelsCtrl', function($rootScope, $timeout, $location, $scope, Session, $state, dataService, username) {
    	$scope.channels = {
    		twitter: {
    			status: 'notactive'
    		},
    		spark: {
    			status: 'notactive'
    		}
    	};

        $scope.activate = function (channelname, accessToken) {
            function activatePopupMessage () {
                $timeout(function() {
                    if(popupWindow) {
                        popupWindow.postMessage('ping', 'http://scxml.io');
                        activatePopupMessage();  
                    }
                }, 1000);
            }

        	if(channelname === 'twitter') {
        		$scope.channels.twitter.status = 'loading';

                var popupWindow;

        		//Start listening for child windows
                window.addEventListener('message', function(e) {
                    console.log(e);
                    var result = e.data;
                    if(result.error) {
                        popupWindow.close();
                        popupWindow = null;

                        alertify.error(result.error.data);
                        $scope.channels.twitter.status = 'notactive';
                    } else if(result.token) {
                        popupWindow.close();
                        popupWindow = null;

                        dataService.saveChannelData(username, channelname, result).then(function() {
                            $scope.channels.twitter.status = 'success';
                            alertify.success('"' + channelname  + '" channel activated.');
                        });
                    }
                }, false);

        		popupWindow = window.open($rootScope.simulationServerUrl + '/channels/twitter', '_blank');

                activatePopupMessage();
        	} else if(channelname === 'spark') {
        		if(accessToken) {
        			dataService.getSparkDevicesOnSpark(accessToken).then(function(result) {
						dataService.saveSparkDevices(username, channelname, accessToken, result.data).then(function() {
							$scope.channels.spark.status = 'success';
							alertify.success('"' + channelname  + '" channel activated.');
						}, function (error) {
							alertify.error(error);
						});
					});
        		} else {
        			window.open('https://www.spark.io/build/new', '_blank');
        			$scope.channels.spark.status = 'loading';
        		}
        		
        	}
        };
    });