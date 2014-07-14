'use strict';

angular.module('mean-local-authApp.controllers')
.controller('SigninCtrl', function($scope, $location, AuthService, FlashLikeMessageService) {
  $scope.signinSubmitted = false;
  $scope.signin = {
    username: null, // note that we call this field username, but it may contain a
    // username or email address depending on what user wants to login with
    password: null
  };
  $scope.alerts = {
    incorrect: false,
    acctFreezeWarning: false,
    attemptsRemaining: null,
    acctFrozen: false,
    successfulPasswordChange: false // this is used after a forgotten password has been successfully changed
  };

  // set alerts.successfulPasswordChange to true if a forgotten password has just been changed
  $scope.alerts.successfulPasswordChange = FlashLikeMessageService.messageIndicator('successfulPasswordChange');

  $scope.submitSigninForm = function(signin) {
    // reset alerts
    $scope.alerts.incorrect = false;
    $scope.alerts.acctFreezeWarning = false;
    $scope.alerts.acctFrozen = false;
    $scope.alerts.successfulChange = false;

    if ($scope.signinForm.$valid) {
      AuthService.signin(signin)
      .then(function(username){
        // emit signedIn event which will be heard by NavCtrl, to set isAuthenticated status
        $scope.$emit('signedIn');

        // take user to their homepage
        // note in future we won't necessarily want to take the user to their homepage,
        // we may want to take them back to the original page they were on
        $location.path('/user/' + username);
      }, function(reason) {
        if (reason === 'Unauthorized') {
          $scope.alerts.incorrect = true;
        }
        $scope.signinSubmitted = true;
        $scope.signin.password = null;
      });
    } else {
      $scope.signinSubmitted = true;
      $scope.alerts.incorrect = true;
      $scope.signin.password = null;
    }
  };

  $scope.closeAlert = function(itemName) {
    $scope.alerts[itemName] = false;
  };
});
