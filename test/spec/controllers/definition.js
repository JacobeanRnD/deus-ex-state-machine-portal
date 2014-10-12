'use strict';

describe('Controller: DefinitionCtrl', function () {

  // load the controller's module
  beforeEach(module('deusExStateMachinePortalApp'));

  var DefinitionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DefinitionCtrl = $controller('DefinitionCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    // expect(scope.awesomeThings.length).toBe(3);
  });
});
