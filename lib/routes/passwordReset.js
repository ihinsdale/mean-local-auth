'use strict';

var env = process.env.NODE_ENV;
var config = require('../config/keys/' + env + '/config.json');
var User = require('../models/User.js').User;
var validator = require('validator');

// Cf. Adapted from https://github.com/substack/node-password-reset

var forgot = require('../../node_modules_custom/password-reset-nodemailer/index.js')({
  uri : 'https://' + config.publicDNS + '/#/_password_reset',
  from : config.passResetEmailHandle + '@'TODO,
  transportType: 'SES',
  transportOptions: {
    AWSAccessKeyID: config.AWSSES.accessKeyId,
    AWSSecretKey: config.AWSSES.secretAccessKey
  }
});

module.exports = function(app) {
  app.use(forgot.middleware); // note that this step actually creates
  // the route specified in forgot's opts.uri, namely /api/password_reset

  app.post('/api/forgot_password', function (req, res) {
      var email = req.body.email;
      if (!validator.isEmail(email)) {
        res.send(400);
      } else {
        User.findOne({ email: email }, function (err, user) {
          if (err) {
            res.send(500);
          } else if (!user) {
            res.send(400);
          } else {
            // TODO - shouldn't we delete any preexisting reset id's/tokens
            // for this user before creating a new one?
            // Cf. http://www.troyhunt.com/2012/05/everything-you-ever-wanted-to-know.html
            var callback = {
              error: function(err) {
                res.send(500);
                console.log('Error sending message:', err);
              },
              success: function(success) {
                res.send(200, 'Check your inbox for a password reset message.');
              }
            };
            var reset = forgot(email, callback);

            reset.on('request', function (req_, res_) {
              req_.session.reset = { email : email, id : reset.id };
              res_.send(200);
            });
          }
        });
      }
  });

  app.post('/api/reset_password', function (req, res) {
    if (!req.session.reset) {
      return res.send(400, 'Reset token not set.');
    }

    var password = req.body.password;
    // in the signup route, we don't check that the two versions of the password match
    // but we can do that here--it's not necessary but there's no harm
    var confirm = req.body.confirm;
    if (password !== confirm) {
      return res.send(400, 'Passwords do not match.');
    }

    if (!validator.matches(password, /(?=.*\d)(?=.*[A-Z])/) ||
        !validator.isLength(password, 8)) {
      return res.send(400, 'Password must be at least 8 characters, contain at least one numeral, and contain at least one uppercase letter.');
    }

    // save the new password
    User.findOne({ email: req.session.reset.email }, function (err, user) {
      if (err) {
        res.send(500);
      } else if (!user) {
        res.send(500); // 500 rather than 400 because it's the server's fault that
        // req.session.reset.email apparently isn't valid
      } else {
        user.password = password;
        user.save(function(err2) {
          if (err2) {
            res.send(500);
          } else {
            forgot.expire(req.session.reset.id);
            delete req.session.reset;
            res.send(200, 'Password successfully reset.');
            // should redirect to login page, and use info alert to say 'New password set successfully.'
          }
        });
      }
    });
  });

};
