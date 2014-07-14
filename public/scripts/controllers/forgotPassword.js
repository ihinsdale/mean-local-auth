'use strict';

angular.module('mean-local-authApp.controllers')
.controller('ForgotPasswordCtrl', function($scope, AuthService, FlashLikeMessageService) {
  $scope.resetAlertsFalse = function() {
    $scope.alerts = {
      incorrect: false,
      invalid: false,
      invalidResetToken: false // this alert is used when there is a failure at the
      // password reset checkpoint
    };
  };

  $scope.resetAlertsFalse(); // initialize alerts as false
  $scope.forgottenPasswordEmail = null;
  $scope.submitted = false;
  $scope.successfulRequest = false;

  // set alerts.tokenFailure to true if user has just failed to pass the
  // password reset checkpoint
  $scope.alerts.invalidResetToken = FlashLikeMessageService.messageIndicator('invalidResetToken');

  $scope.requestPasswordReset = function(email) {
    $scope.resetAlertsFalse();
    if ($scope.forgotPasswordForm.$valid) {
      AuthService.requestPasswordReset(email).then(function(){
        $scope.successfulRequest = true;
      }, function(reason) {
        if (reason === 'Incorrect') {
          $scope.alerts.incorrect = true;
        }
        $scope.submitted = true;
      });
    } else {
      $scope.submitted = true;
      $scope.alerts.invalid = true;
    }
  };

  $scope.closeAlert = function(itemName) {
    $scope.alerts[itemName] = false;
  };
});
