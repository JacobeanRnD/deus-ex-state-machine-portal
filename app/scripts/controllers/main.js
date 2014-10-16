'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
    .controller('MainCtrl', function($scope, dataService, $routeParams) {

        $scope.loading = false;
        // charts.data.forEach(function(name, i, arr) {
        //     arr[i] = {
        //         name: name
        //     };
        // });

        // $scope.stateCharts = charts.data;

        function loadStatesharts() {
            // dataService.getAllStateCharts().then(function(response) {
            //     response.data.forEach(function(name, i, arr) {
            //         arr[i] = {
            //             name: name
            //         };
            //     });

            //     $scope.stateCharts = response.data;
            //     $scope.loading = false;

            //     if($routeParams.stateChartId) {
            //         var charts = $scope.stateCharts.filter(function (item) {
            //             return item.name === $routeParams.stateChartId.toString();
            //         });

            //         if(charts.length !== 0) {
            //             selectStateChart(charts[0]);    
            //         }
            //     }
            // });
        }

        function loadInstances(chartName) {
            dataService.getInstances(chartName).then(function(response) {
                response.data.forEach(function(id, i, arr) {
                    arr[i] = {
                        id: id
                    };
                });

                $scope.stateChart.instances = response.data;

                if($routeParams.instanceId) {
                    var instance = $scope.stateChart.instances.filter(function (item) {
                        return item.id === $routeParams.instanceId;
                    })[0];

                    selectInstance(instance);
                }
            });
        }

        function draw() {
            var doc = (new DOMParser()).parseFromString($scope.stateChart.content, 'application/xml');
            var scxmlTrace = $('#scxmlTrace');

            scxmlTrace.empty();

            ScxmlViz(scxmlTrace[0], doc, scxmlTrace.width(), scxmlTrace.height()); // jshint ignore:line
        }

        function closeInstanceSubscription () {
            if($scope.source) {
                $scope.source.close();
            }
        }

        loadStatesharts();

        // function selectStateChart(chart) {
        //     closeInstanceSubscription();
        //     $scope.isCreating = false;
        //     $scope.stateChart = {
        //         name: chart.name,
        //         content: ''
        //     };

        //     dataService.getStateChart(chart.name).then(function(response) {
        //         $scope.stateChart.content = response.data;

        //         draw();

        //         loadInstances(chart.name);
        //     });
        // }

        $scope.deleteStateChart = function(chart) {
            closeInstanceSubscription();
            dataService.deleteStateChart(chart.name).then(function() {
                $scope.stateChart = null;
                loadStatesharts();
                alertify.success('Statechart deleted');
            });
        };

        function selectInstance(instance) {
            closeInstanceSubscription();
            $scope.stateChart.instance = instance;
            $scope.stateChart.instance.events = [];

            var source = dataService.subscribeInstance($scope.stateChart.name, instance.id);
            if(source) {
                $scope.source = source;

                source.addEventListener('onEntry', function(e) {
                    d3.select($('#scxmlTrace #' + e.data)[0]).classed('highlighted', true);
                    $scope.stateChart.instance.events.push('onEntry -> ' + e.data);
                }, false);
                source.addEventListener('onExit', function(e) {
                    d3.select($('#scxmlTrace #' + e.data)[0]).classed('highlighted', false);
                    $scope.stateChart.instance.events.push('onExit -> ' + e.data);
                }, false);

                window.onbeforeunload = function(){
                    closeInstanceSubscription();
                };
            }

            dataService.getInstanceDetails($scope.stateChart.name, instance.id).then(function(response) {
                d3.select($('#scxmlTrace #' + response.data[0])[0]).classed('highlighted', true);

                $scope.stateChart.instance.details = JSON.stringify(response.data[3], null, 4);
            });
        }

        $scope.deleteInstance = function(instance) {
            closeInstanceSubscription();
            dataService.deleteInstance($scope.stateChart.name, instance.id).then(function() {

                $scope.stateChart.instance = null;
                loadInstances($scope.stateChart.name);
                alertify.success('Instance deleted');
            });
        };

        $scope.sendEvent = function(eventname, eventdata) {
            dataService.sendEvent($scope.stateChart.name, $scope.stateChart.instance.id, eventname, eventdata).then(function() {
                $scope.stateChart.instance.events.push('event sent -> ' + eventname + (eventdata ?  (' - ' + eventdata) : ''));
            });
        };

        $scope.createStatechart = function() {
            closeInstanceSubscription();
            $scope.isCreating = true;
            $scope.stateChart = {
                content:    '<scxml name="helloworld">\n' +
                            '   <state id="a">\n' +
                            '       <transition target="b" event="e1"/>\n' +
                            '   </state>\n' +
                            '   <state id="b"/>\n' +
                            '</scxml>'
            };
            
            draw();
        };

        $scope.aceChanged = function() {
            draw();
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

            dataService.createStateChart(content).then(function() {
                loadStatesharts();

                alertify.success('Statechart saved');

                $scope.stateChart = null;
                $scope.isCreating = false;
            }, function(response) {
                if (response.data.message) {
                    alertify.error(response.data.message);
                } else {
                    alertify.error('An error occured');
                }
            });
        };

        $scope.createInstance = function(stateChart) {
            closeInstanceSubscription();
            dataService.createInstance(stateChart.name).then(function() {
                loadInstances(stateChart.name);

                alertify.success('Instance created');
            }, function(response) {
                if (response.data.message) {
                    alertify.error(response.data.message);
                } else {
                    alertify.error('An error occured');
                }
            });
        };
    });