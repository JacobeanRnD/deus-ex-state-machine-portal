'use strict';

/**
 * @ngdoc function
 * @name deusExStateMachinePortalApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the deusExStateMachinePortalApp
 */
angular.module('deusExStateMachinePortalApp')
  .controller('EditorCtrl', function ($scope, $state, simulateService, dataService, chartName, chartContent, username) {
    $scope.chartName = chartName;
    $scope.chartContent = chartContent.data;
    $scope.username = username;

    simulateService.update($scope.chartContent);

    $scope.aceChanged = function () {
      simulateService.update($scope.chartContent);
    };

    $scope.saveStatechart = function (content) {
      checkChartContent(content, function (error, name) {
        if (error) {
          alertify.error(error);
          return;
        }

        var isCreate = $state.$current.name === 'main.charts.new';

        dataService.saveStateChart(isCreate ? null : name, username, content).then(function () {
          simulateService.chartSaved(name);

          $state.go('main.charts.detail', {
            chartName: name
          }, {
            reload: true
          });
          alertify.success('Statechart saved');
        }, function (response) {
          if (response.status === 400) {
            alertify.error(response.data.message ||  response.data);
          } else {
            alertify.error('An error occured');
          }
        });
      });
    };

    function checkChartContent(content, done) {

      if (!content || content.length === 0) {
        done('Please enter code for your Statechart');
        return;
      }

      var doc;

      try {
        doc = (new DOMParser()).parseFromString(content, 'application/xml');

        if (doc.getElementsByTagName('parsererror').length) {
          throw ({
            //Only div in parsererror contains the error message
            //If there is more than one error, browser shows only the first error
            message: $(doc).find('parsererror div').html()
          });
        }
      } catch (e) {
        done(e.message);
        return;
      }

      done(null, doc.documentElement.getAttribute('name'));
      return;
    }
  });

