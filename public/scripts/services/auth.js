'use strict';

angular.module('mean-local-authApp.services')
.factory('AuthService', ['$q', '$http', function($q, $http) {
  var service = {
    currentUser: null,
    haveAskedServerForInitAuthStatus: false,
    askServerIfAuthenticated: function() {
      var d = $q.defer();
      $http.get('/api/is_authenticated')
      .success(function(responseData, status) {
        service.currentUser = responseData.username;
        service.haveAskedServerForInitAuthStatus = true;
        d.resolve(!!service.currentUser);
      })
      .error(function(reason, status) {
        console.log('Error:', reason);
        d.reject(reason);
      });
      return d.promise;
    },
    isAuthenticated: function() {
      if (!service.haveAskedServerForInitAuthStatus) {
        return service.askServerIfAuthenticated();
      } else {
        var d = $q.defer();
        d.resolve(!!service.currentUser);
        return d.promise;
      }
    },
    authHelper: function(route, data) {
      var d = $q.defer();
      $http({ method: 'POST', url: route, data: data })
      .success(function(responseData, status) {
        console.log('inside authHelper success');
        console.log('responseData are:', responseData);
        console.log('status:', status);
        service.currentUser = responseData.username;
        d.resolve(responseData.username);
      })
      .error(function(reason, status) {
        console.log('Error:', reason);
        d.reject(reason);
      });
      return d.promise;
    },
    signup: function(signupData) {
      return service.authHelper('/api/signup', {
        username: signupData.username,
        email: signupData.email,
        password: signupData.password1
      });
    },
    signin: function(signinData) {
      return service.authHelper('/api/signin', {
        username: signinData.username,
        password: signinData.password
      });
    },
    signout: function() {
      var d = $q.defer();
      $http({ method: 'POST', url: '/api/signout', data: {} })
      .success(function(data) {
        service.currentUser = null;
        d.resolve('Success');
      }).error(function(reason, status) {
        d.reject(reason);
      });
      return d.promise;
    },
    requestPasswordReset: function(email) {
      var d = $q.defer();
      $http({ method: 'POST', url: '/api/forgot_password', data: {
        email: email
      }})
      .success(function() {
        d.resolve('Success');
      })
      .error(function(reason, status) {
        if (status === 400) {
          d.reject('Incorrect');
        } else {
          d.reject(reason);
        }
      });
      return d.promise;
    },
    tryToPassPasswordResetCheckpoint: function(token) {
      var d = $q.defer();
      // in line below, we need to build the request url ourselves because using the params feature
      // of $http's config object causes the = to get encoded
      console.log('password reset token/id is:', token);
      $http({ method: 'GET', url: '/api/_password_reset?' + token + '==' })
      .success(function() {
        d.resolve('Success');
      })
      .error(function(reason, status) {
        d.reject(reason);
      });
      return d.promise;
    },
    changeForgottenPassword: function(newPassword) {
      var d = $q.defer();
      $http({ method: 'POST', url: '/api/reset_password', data: {
        password: newPassword.password1,
        confirm: newPassword.password2
      }})
      .success(function() {
        d.resolve('Success');
      })
      .error(function(reason, status) {
        d.reject(reason);
      });
      return d.promise;
    }
  };

  return service;
}]);
