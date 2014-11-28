'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('EditorCtrl', function($scope, $state, simulateService, dataService, chartName, chartContent, username) {
        $scope.chartName = chartName;
        $scope.chartContent = chartContent.data;
        $scope.username = username;

        simulateService.update($scope.chartContent);

        function parseXmlDocument(text) {
          var parser=new DOMParser();
          return parser.parseFromString(text,"text/xml");
        };

        function xmlStringify(xmlNode) {
          // https://developer.mozilla.org/en-US/docs/XMLSerializer
          if (typeof XMLSerializer !== 'undefined') {
            return (new XMLSerializer()).serializeToString(xmlNode);
          }
         
          // IE
          if (xmlNode.xml) {
            return xmlNode.xml;
          }
          
          throw 'no method available to stringify xml';
        }
        
        var oldScxmlDocument = parseXmlDocument($scope.chartContent);
        $scope.aceChanged = function() {
          try {
            var newScxmlDocument = parseXmlDocument($scope.chartContent);

            if( newScxmlDocument.getElementsByTagName('parsererror').length ){
              //there was a parser error, but for some reason it didn't throw an exception
              return;
            }

            //we have to re-parse
            oldScxmlDocument = parseXmlDocument(xmlStringify(oldScxmlDocument));    
            var matchings = Match.easyMatch(oldScxmlDocument, newScxmlDocument);

            console.log('matchings',matchings);

            var es = new EditScript(oldScxmlDocument, newScxmlDocument, matchings);
            var delta = es.create();

            console.log('delta.getUpdated()',delta.getUpdated());
            console.log('delta.getDeleted()',delta.getDeleted());
            console.log('delta.getInserted()',delta.getInserted());

            //TODO: any new nodes need id assigned
            //TODO: are the errors we're seeing user errors? Or library errors?

            //we don't need to apply the patch, as es.create does it for us
            //(new InternalPatch()).apply(oldScxmlDocument, delta);

            console.log('oldScxmlDocument',xmlStringify(oldScxmlDocument));

            simulateService.update($scope.chartContent);
          } catch(e){
            if(e.message === 'unable to parse xml document'){
              //ignore 
            }else{
              console.log('There was an error',e);
            }
          }
        };

        $scope.saveStatechart = function(content) {
            var isError = false;

            if (!content || content.length === 0) {
                isError = true;
                alertify.error('Please enter code for your Statechart');
            }

            if (isError) {
                return;
            }

            dataService.createStateChart(username, content).then(function() {
                $state.go('.', null, { reload: true });
                //TODO: select newly created chart

                alertify.success('Statechart saved');
            }, function(response) {
                if (response.data.message) {
                    alertify.error(response.data.message);
                } else {
                    alertify.error('An error occured');
                }
            });
        };

        
    });
