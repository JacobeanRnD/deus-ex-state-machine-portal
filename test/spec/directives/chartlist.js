'use strict';

describe('Directive: chartList', function () {

  // load the directive's module
  beforeEach(module('deusExStateMachinePortalApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<chart-list></chart-list>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the chartList directive');
  }));
});
