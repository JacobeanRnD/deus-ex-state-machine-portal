'use strict';

/**
 * @ngdoc service
 * @name deusExStateMachinePortalApp.Session
 * @description
 * # Session
 * Service in the deusExStateMachinePortalApp.
 */
angular.module('deusExStateMachinePortalApp')
  .service('Session', function Session($rootScope, $http) {
    var session = {
      login : function(username,password){
        return $http({
            method: 'POST',
            url: '/api/_session',
            data: $.param({name:username,password:password}),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then(function(response){
              // alertify.success('success');
              return session.refresh(response);
            },function(){
              // alertify.success('fail');
            });
      },
      refresh : function() {
        return $http.get('/api/_session', { params: { 'cache': new Date().getTime() }  }).then(
          function(response){
            var userCtx = response.data.userCtx;
            session.userCtx = userCtx;
            $rootScope.session = session;

            return userCtx;
          });
      }
    };
  });
