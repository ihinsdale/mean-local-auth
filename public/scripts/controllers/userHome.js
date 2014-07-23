'use strict';

angular.module('mean-local-authApp.controllers')
.controller('UserHomeCtrl', function($scope, userInfo) {
  $scope.userInfo = userInfo;
});
