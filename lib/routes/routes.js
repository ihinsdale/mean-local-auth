'use strict';

var async = require('async');
var dbClient = require('../controllers/dbRW.js');
var validate = require('../controllers/validate.js');
var passport = require('passport');
var permit = require('../controllers/permit.js');

module.exports = function(app) {

  // Auth-related routes and middleware

  app.route('/').get(function(req, res) {
    res.render('index', { title: 'Express' });
  });

  app.route('/api/signup').post(function(req, res) {
    console.log('signup request looks like:', req.body);
    async.waterfall([
      function(callback) {
        validate.signupUser(req.body, callback);
      },
      dbClient.createUser,
      function(user, callback) {
        // login the user using the login method which Passport exposes on req
        req.login(user, function(err) {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        });
      }
    ], function(error) {
      if (error) {
        console.log('Error signing up user:', error);
        var errorCode = 500;
        switch(error) {
        case 'Required data missing.':
        case 'Invalid email address.':
        case 'Username must contain only alphanumeric characters or dashes and not begin with a dash.':
        case 'Username must be 25 characters or fewer.':
        case 'Invalid username. Username should not be an email address.':
        case 'Password must be at least 8 characters.':
        case 'Password must use at least one numeral and uppercase letter.':
        case 'Email address in use.': // we use code 400 for this email conflict
        // because we don't want to distinguish between an invalid email address
        // and one that is already being used, for privacy reasons
          errorCode = 400;
          break;
        case 'Username taken.':
          errorCode = 409;
          break;
        default:
          break;
        }
        if (errorCode !== 500) {
          res.send(errorCode); // could conceivably send error message here too
        } else {
          res.send(errorCode);
        }
      } else {
        res.send(200);
        // will do redirection to user homepage on the client-side
      }
    });
  });

  app.post('/api/signin',
    passport.authenticate('local'),
    function(req, res) {
      res.send(200);
    }
  );

  app.route('/api/signout').all(permit.ensureAuthenticated).post(function(req, res) {
    console.log('inside /api/signout route');
    // passport.js provides a logout method on the req object which removes req.user and clears the passport part of the session
    req.logout();
    // but to destroy the session fully we have to do so ourselves: Cf. https://github.com/jaredhanson/passport/issues/216
    // and we want to destroy the session fully so that the end of session is registered with Redis
    req.session.destroy(function(error) {
      if (!error) {
        res.send(200);
      } else {
        res.send(500);
      }
    });
  });

  app.route('/api/is_authenticated').get(function(req, res) {
    console.log('inside /api/is_authenticated route');
    var data = { username: null, status: false };
    if (req.isAuthenticated()) {
      data.username = req.user.username;
      data.status = true;
    }
    res.send(data);
  });

  app.post('/api/check/username', function(req, res) {
    if (!req.body.hasOwnProperty('field')) {
      res.send(400);
    } else {
      // note we are not doing any validation that in fact the username e.g. does
      // not look like an email address -- that is a validation concern we handle elsewhere in signup processing
      dbClient.checkUsernameAvailable(req.body.field, function(err, isUnique) {
        if (err) {
          res.send(500);
        } else {
          res.send(200, { isUnique: isUnique });
        }
      });
    }
  });

  app.post('/api/check/email', function(req, res) {
    if (!req.body.hasOwnProperty('field')) {
      res.send(400);
    } else {
      // note we are not doing any validation that the email address looks like
      // an actual email address -- that is a validation concern we handle elsewhere in signup processing
      dbClient.checkEmailUnused(req.body.field, function(err, isUnique) {
        if (err) {
          res.send(500);
        } else {
          res.send(200, { isUnique: isUnique });
          // This route does expose whether a particular email address is already
          // being used. There's no way around exposing this functionality, really.
          // We could combine validation that it's a well-formed email address with
          // uniqueness checking, but this doesn't really obfuscate the uniqueness
          // checking, because everyone knows what a valid email address looks like.
          // Best we can do is not explicitly revealing uniqueness on the client side.
        }
      });
    }
  });

  // User-related routes

  app.get('/api/users/:username', function(req, res) {
    var requestedUsername = req.params.username;
    if (req.isAuthenticated() && req.user.username === requestedUsername) {
      res.send('Public and private info for user ' + requestedUsername);
    } else {
      res.send('Public-only info for user ' + requestedUsername);
    }
  });

};
