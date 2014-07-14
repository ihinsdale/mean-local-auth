'use strict';

angular.module('mean-local-authApp.services')
.factory('FlashLikeMessageService', [function() {
  var service = {
    successfulPasswordChange: false,
    invalidResetToken: false,
    messageIndicator: function(name) {
      if (!service[name]) {
        return false;
      } else {
        // if service[name] is true, we only want it to be gotten as true once
        // so we set it to false afterwards
        // this works, because we know it only gets set to true just before it is gotten
        var temp = service[name];
        service[name] = false;
        return temp;
      }
    }
  };

  return service;
}]);
