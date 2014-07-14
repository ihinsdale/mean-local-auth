'use strict';

angular.module('mean-local-authApp')
.factory('mean-local-authInterceptor', ['$q', '$location', '$rootScope', function($q, $location, $rootScope) {
  var interceptor = {
    responseError: function(rejection) {
      if (rejection.status === 401) {
        console.log('401 response from server intercepted, redirecting to #/signin.');
        $rootScope.$broadcast('notAuthorized');
        $location.path('/signin');
      }
      return $q.reject(rejection);
    }
  };

  return interceptor;
}]);
