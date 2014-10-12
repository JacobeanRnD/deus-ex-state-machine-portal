'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('MainCtrl', function($scope, $routeParams, dataService) {

        if($routeParams.definitionId) {
            var definitionId = $routeParams.definitionId;

            if(definitionId === 'new') {
                $scope.definition = {};

            } else {
                dataService.getDefinition().get({ definitionId: definitionId }, function(definition) {
                    $scope.definition = definition;
                });
            }
        }


        dataService.getAllDefinitions().query().$promise.then(function(scDefinitions) {
            $scope.scDefinitions = scDefinitions;
        });
        

        $scope.prettify = function(scxml) {
            return htmlDecode(scxml);
        };

        function htmlDecode(input){
            var e = document.createElement('div');
            e.innerHTML = input;
            return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
        }
    });