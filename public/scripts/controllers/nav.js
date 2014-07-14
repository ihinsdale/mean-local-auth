'use strict';

angular.module('mean-local-authApp.controllers')
.controller('NavCtrl', function($scope, $location, AuthService) {
  $scope.initialLoadUp = true;
  var refreshAuthStatus = function(isFirstRefresh) {
    AuthService.isAuthenticated().then(function(authStatus){
      $scope.isAuthenticated = authStatus;
      if (isFirstRefresh) {
        $scope.initialLoadUp = false;
      }
    }, function(reason){
      console.log('Error determining authentication status:', reason);
      $scope.isAuthenticated = null;
      if (isFirstRefresh) {
        $scope.initialLoadUp = false;
      }
    });
  };

  // set initial authentication status
  refreshAuthStatus(true);

  $scope.$on('signedIn', function(){
    console.log('NavCtrl heard signedIn event');
    // this event is emitted by our signup/signin functions
    refreshAuthStatus();
  });

  $scope.$on('notAuthorized', function(){
    console.log('NavCtrl heard notAuthorized event');
    // this event is broadcast by our 401 response interceptor
    if (AuthService.currentUser) {
      // if client-side thinks it's logged in, revise that
      AuthService.currentUser = null;
    }
    refreshAuthStatus();
  });

  $scope.signout = function() {
    AuthService.signout().then(function() {
      // update isAuthenticated status
      refreshAuthStatus();
      // take user back to homepage
      $location.path('/');
    }, function(reason) {
      console.log('Error signing out:', reason);
    });
  };

});
