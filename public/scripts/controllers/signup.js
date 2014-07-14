'use strict';

angular.module('mean-local-authApp.controllers')
.controller('SignupCtrl', function($scope, $location, AuthService) {
  // password validation is done via regex using ng-pattern in the form
  // some username validation is also done the same way
  $scope.signupSubmitted = false;
  $scope.signup = {
    username: null,
    email: null,
    password1: null,
    password2: null
  };

  $scope.submitSignupForm = function(signup) {
    if ($scope.signupForm.$valid) {
      AuthService.signup(signup)
      .then(function(username){
        // since successful signup also results in authentication, we want to
        // emit signedIn event which will be heard by NavCtrl, to set isAuthenticated status
        // just as we do for the normal signin process
        $scope.$emit('signedIn');

        // take user to their homepage
        $location.path('/user/' + username);
      }, function(reason) {
        console.log('Error signing up:', reason);
        $scope.signupSubmitted = true;
      });
    } else {
      $scope.signupSubmitted = true;
    }
  };
});
