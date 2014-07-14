'use strict';

var validator = require('validator');
var async = require('async');
var _ = require('underscore');

var dbClient = require('./dbRW.js');

var User = require('../models/User.js').User;

exports.signupUser = function(signupData, callback) {

  // First we do all the synchronous/blocking validation

  // check that required data are present
  if (!signupData.username || !signupData.email || !signupData.password) {
    callback('Required data missing.');
  // check that email is a valid email address
  } else if (!validator.isEmail(signupData.email)) {
    callback('Invalid email address.');
  // check that username contains only alphanumeric characters or dashes and does not begin with a dash
  } else if (!validator.matches(signupData.username, /^[A-Za-z0-9][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*$/)) {
    // for understanding this regexp, cf. http://www.regexr.com/ and http://stackoverflow.com/a/1330703
    callback('Username must contain only alphanumeric characters or dashes and not begin with a dash.');
  // check that username is not more than 25 characters
  } else if (validator.isLength(signupData.username, 26)) {
    callback('Username must be 25 characters or fewer.');
  // check that username does not look like an email address
  } else if (validator.isEmail(signupData.username)) {
    // Note that we shouldn't ever actually hit this case, because
    // an @ symbol would be caught by the pattern matching above that allows
    // only alphanumeric characters and non-leading dashes
    callback('Invalid username. Username should not be an email address.');
  // check that password meets requirements
  } else if (!validator.isLength(signupData.password, 8)) {
    callback('Password must be at least 8 characters.');
  } else if (!validator.matches(signupData.password, /(?=.*\d)(?=.*[A-Z])/)) {
    // Cf. http://stackoverflow.com/a/5142164
    callback('Password must use at least one numeral and uppercase letter.');
  } else {

  // Next we do the asynchronous validation

    async.parallel([
      // check availability/uniqueness of username
      function(callback2) {
        dbClient.checkUsernameAvailable(signupData.username, function(err, result){
          if (err) {
            callback2(err);
          } else {
            if (!result) {
              callback2('Username taken.');
            } else {
              callback2(null);
            }
          }
        });
      },
      // check availability/uniqueness of email address
      function(callback2) {
        dbClient.checkEmailUnused(signupData.email, function(err, result){
          if (err) {
            callback2(err);
          } else {
            if (!result) {
              callback2('Email address in use.');
            } else {
              callback2(null);
            }
          }
        });
      }
    ],
    function(err, results){
      if (err) {
        callback(err);
      } else {
        callback(null, signupData);
      }
    });
  }
};
