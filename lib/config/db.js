'use strict';

var mongoose = require('mongoose');
var config = require('./config.json');

module.exports = function() {
  // Setup MongoDB connection
  var dbConnUrl = 'mongodb://' + config.db.username + ':' +
                  config.db.password + '@'+ config.db.host + ':' +
                  config.db.port + '/mean-local-auth';
  mongoose.connect(dbConnUrl, function(err) {
    if (err) {
      throw err;
    }
    console.log('Successfully connected to MongoDB');
  });
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
};
