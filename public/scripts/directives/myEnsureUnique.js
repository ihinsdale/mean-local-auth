'use strict';

angular.module('mean-local-authApp.directives')
.directive('myEnsureUnique', ['$http', '$timeout', function($http, $timeout) {
  // Cf. ng-book pp. 50
  // Cf. http://jsbin.com/ePomUnI/7/edit
  return {
    require: 'ngModel',
    link: function(scope, ele, attrs, c) {
      var pendingTimeout;
      // Cf. http://www.mircozeiss.com/github-like-signup-form-with-angularjs-and-bootstrap-v3/
      scope.$watch(attrs.ngModel, function(value) {

        var uniquenessStatusVarName = 'unique' + attrs.myEnsureUnique;

        // we could hide old error message, using this line:
        //c.$setValidity(uniquenessStatusVarName, true);
        // but we don't want to do that because it will enable the user to submit
        // a signup request for a username/email which may not have been verified for uniqueness
        // this is a matter of latency -- i.e. how long it takes for the uniqueness response
        // to come back from the server
        // Instead we can hide the error message while uniqueness is being checked by
        // using the busyChecking variable with ng-class

        if (!value) {
          // don't send undefined to the server during dirty check
          return;
        }

        // show spinner
        scope['busyChecking' + attrs.myEnsureUnique] = true;

        // stop an existing timeout process -- so as long as the user is typing
        // faster than a character per 300ms, the POST request won't be made
        // i.e. it'll be made after a pause in their typing
        // Cf. https://medium.com/@sammla_/angularjs-a-unique-validation-48d9e823e17e
        $timeout.cancel(pendingTimeout);
        pendingTimeout = $timeout(function(){
          $http({
            method: 'POST',
            url: '/api/check/' + attrs.myEnsureUnique,
            data: {'field': value}
          }).success(function(data, status, headers, cfg) {
            c.$setValidity(uniquenessStatusVarName, data.isUnique);
            scope['busyChecking' + attrs.myEnsureUnique] = false;
          }).error(function(data, status, headers, cfg) {
            c.$setValidity(uniquenessStatusVarName, false);
            scope['busyChecking' + attrs.myEnsureUnique] = false;
          });
        }, 300);
      });
    }
  };
}]);
