'use strict';

/**
 * @ngdoc service
 * @name deusExStateMachinePortalApp.dataService
 * @description
 * # dataService
 * Factory in the deusExStateMachinePortalApp.
 */
angular.module('deusExStateMachinePortalApp')
  .factory('dataService', function ($resource) {
    // Service logic
    // ...

    // Public API here
    return {
      getAllDefinitions: function (username) { // jshint ignore:line
        //TODO Query with username.
        return $resource('scripts/mocks/definitions.json');
      },
      getDefinition: function () { // jshint ignore:line
        //TODO Query with definitionId
        return $resource('scripts/mocks/definition/:definitionId.json', { definitionId: '@definitionId' });
      }
    };
  });
