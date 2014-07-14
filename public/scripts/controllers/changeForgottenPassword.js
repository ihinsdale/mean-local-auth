'use strict';

angular.module('mean-local-authApp.controllers')
.controller('ChangeForgottenPasswordCtrl', function($scope, $location, AuthService) {
  // password validation is done via regex using ng-pattern in the form
  $scope.formSubmitted = false;
  $scope.newPassword = {
    password1: null,
    password2: null
  };

  $scope.changeForgottenPassword = function(newPassword) {
    if ($scope.newPasswordForm.$valid) {
      AuthService.changeForgottenPassword(newPassword)
      .then(function(){
        // take user to signin page where they can login with new password
        $location.path('/signin');
        // TODO - how to display alert on signin page that New password has been set successfully?
      }, function(reason) {
        console.log('Error changing forgotten password:', reason);
        $scope.formSubmitted = true;
      });
    } else {
      $scope.formSubmitted = true;
    }
  };
});
