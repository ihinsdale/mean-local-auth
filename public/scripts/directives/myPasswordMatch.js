'use strict';

angular.module('mean-local-authApp.directives')
.directive('myPasswordMatch', [function () {
  // Cf. http://rogeralsing.com/2013/08/26/angularjs-directive-to-check-that-passwords-match-followup/
  return {
    require: 'ngModel',
    scope: true,
    link: function (scope, elem, attrs, control) {
      var checker = function () {
        //get the value of the first password
        var p2 = scope.$eval(attrs.ngModel);

        //get the value of the other password
        var p1 = scope.$eval(attrs.myPasswordMatch);

        // NB if we logged these values, like so:
        //console.log('p1:', p1);
        //console.log('p2:', p2);
        // we would see that because password1 has ng-minlength and ng-pattern validation
        // also applied to it, Angular actually keeps it undefined until it is valid
        // this causes our p1 === p2 check to return false as long as p1 is not a valid password
        // which would cause the 'Passwords don't match' message to appear
        // if we didn't add an "signupForm.password1.$valid &&" to the ng-show for that message
        // For the same reason, we add "signupForm.password1.$valid && " to the ng-class
        // expressions for displaying the embedded validity-status icon in the input

        return p1 === p2;
      };
      scope.$watch(checker, function (n) {
        //set the form control to valid if both
        //passwords are the same, else invalid
        control.$setValidity('match', n);
      });
    }
  };
}]);
