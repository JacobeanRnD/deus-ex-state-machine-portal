'use strict';

describe('Directive: instancelist', function () {

  // load the directive's module
  beforeEach(module('deusExStateMachinePortalApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<instancelist></instancelist>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the instancelist directive');
  }));
});
