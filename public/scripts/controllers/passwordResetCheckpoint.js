'use strict';

angular.module('mean-local-authApp.controllers')
.controller('PasswordResetCheckpointCtrl', function($scope, $location, AuthService, FlashLikeMessageService) {
  var params = $location.search();
  console.log('parsed params using $location.search() look like:', params);
  AuthService.tryToPassPasswordResetCheckpoint(Object.keys(params)[0]).then(function(){
    FlashLikeMessageService.successfulPasswordChange = true;
    $location.path('/change-forgotten-password');
  }, function(reason) {
    console.log('Error trying to pass password reset checkpoint:', reason);
    // if (reason === 'No auth token specified.'
    // || reason === 'auth token expired') {
    FlashLikeMessageService.invalidResetToken = true;
    $location.path('/forgot-password');
    // }
  });
});
