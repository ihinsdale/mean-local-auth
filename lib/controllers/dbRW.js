'use strict';

var User = require('../models/User.js').User;
var async = require('async');
var _ = require('underscore');

exports.checkUsernameAvailable = function(username, callback) {
  User.findOne({ username: username }, function(err, user) {
    if (err) {
      callback(err);
    } else {
      if (!user) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  });
};

exports.checkEmailUnused = function(email, callback) {
  User.findOne({ email: email }, function(err, user) {
    if (err) {
      callback(err);
    } else {
      if (!user) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  });
};

exports.createUser = function(validatedSignupData, callback) {
  // create a new user
  var theNewUser = new User({
    username: validatedSignupData.username,
    email: validatedSignupData.email,
    password: validatedSignupData.password
  });

  // save user to db
  theNewUser.save(function(err, user) {
    if (err) {
      callback(err);
    } else {
      callback(null, user);
    }
  });
};

exports.deleteUser = function(username, callback) {
  User.findOneAndRemove( {username: username }, function(err, user) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};
