'use strict';

angular
  .module('mean-local-authApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'mean-local-authApp.controllers',
    'mean-local-authApp.services',
    'mean-local-authApp.directives',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/landing.html',
        controller: 'LandingCtrl'
      })
      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/signin', {
        templateUrl: 'views/signin.html',
        controller: 'SigninCtrl'
      })
      .when('/user/:username', {
        templateUrl: 'views/user-home.html',
        controller: 'UserHomeCtrl',
        resolve: {
          userInfo: ['$http', '$q', '$route', function($http, $q, $route) {
            var d = $q.defer();
            $http.get('/api/users/' + $route.current.params.username)
            .success(function(data, status) {
              d.resolve(data);
            })
            .error(function(reason, status) {
              d.reject(reason);
            });
            return d.promise;
          }]
        }
      })
      .when('/forgot-password', {
        templateUrl: 'views/forgot-password.html',
        controller: 'ForgotPasswordCtrl'
      })
      .when('/_password_reset', {
        templateUrl: 'views/loading.html',
        controller: 'PasswordResetCheckpointCtrl'
      })
      .when('/change-forgotten-password', {
        templateUrl: 'views/change-forgotten-password.html',
        controller: 'ChangeForgottenPasswordCtrl'
      })
      .when('/terms', {
        templateUrl: 'views/terms-of-service.html',
        controller: 'StaticCtrl'
      })
      .when('/privacy', {
        templateUrl: 'views/privacy-policy.html',
        controller: 'StaticCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('mean-local-authInterceptor');
  });
