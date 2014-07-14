'use strict';

var async = require('async');
var _ = require('underscore');

exports.ensureAuthenticated = function(req, res, next) {
  console.log('req.isAuthenticated():', req.isAuthenticated());
  if (req.isAuthenticated()) { return next(); }
  res.send(401);
};
