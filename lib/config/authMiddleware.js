'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var validator = require('validator');

var User = require('../models/User.js').User;

module.exports = function(app) {

  passport.use(new LocalStrategy(
    function(username, password, done) {
      // our auth strategy allows the username parameter to contain
      // an actual username, or an email address. I.e. the user can login
      // using either.
      var loginAttemptUsedEmail = validator.isEmail(username);
      var query = loginAttemptUsedEmail ? { email: username } : { username: username };
      User.findOne(query, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          var failedLoginMessage = loginAttemptUsedEmail ?
            'Email address does not exist.' :
            'Username does not exist.';
          console.log(failedLoginMessage, ':', username);
          return done(null, false, { message: 'Incorrect username or password.' });
        }
        user.comparePassword(password, function(err, isMatch) {
          if (err) { return done(err); }
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect username or password.' });
          }
          return done(null, user);
        });
      });
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(_id, done) {
    User.findById(_id, function(err, user) {
      done(err, user);
    });
  });

};
