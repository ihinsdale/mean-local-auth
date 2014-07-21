'use strict';

var request = require('supertest');
var superagent = require('superagent');
var expect = require('expect.js');
var _ = require('underscore');
var async = require('async');

exports.dbClient = require('../../dist/lib/controllers/dbRW.js');

var config = require('../../dist/lib/config/config.json');
exports.config = config;

exports.meanlocalauthUrlInsecure = 'http://' + config.publicDNS;
var meanlocalauthUrl;
exports.meanlocalauthUrl = meanlocalauthUrl = 'https://' + config.publicDNS;

exports.dbConnUrl = 'mongodb://' + config.db.username + ':' +
                    config.db.password + '@'+ config.publicDNS + ':' +
                    config.db.port + '/mean-local-auth';

// test user
var testUser;
exports.testUser = testUser = {
  username: 'test-signup',
  email: config.testing.email,
  password: 'Validpassword1'
};

var testUser2;
exports.testUser2 = testUser2 = {
  username: 'test-signup2',
  email: config.testing.email2,
  password: 'Validpassword1'
};

exports.signinHelper = function(callback, user, createSignedinAgent_testUser) {
  var agent = superagent.agent();
  var req = request(meanlocalauthUrl).post('/api/signin');
  user = user || testUser; // testUser is the default user to use for auth
  req.send(user);
  req.end(function(err, res) {
    if (err) { throw err; }
    expect(res.status).to.eql(200);
    agent.saveCookies(res.res);

    if (createSignedinAgent_testUser) {
      var agent2 = superagent.agent();
      var req2 = request(meanlocalauthUrl).post('/api/signin');
      req2.send(testUser);
      req2.end(function(err2, res2) {
        if (err2) { throw err2; }
        expect(res2.status).to.eql(200);
        agent2.saveCookies(res2.res);
        callback(agent, agent2);
      });
    } else {
      callback(agent);
    }
  });
};

exports.signoutHelper = function(agents, callback) {
  // agents can be an array of signedinAgents, or just a
  // single signedinAgent object

  if (Array.isArray(agents)) {
    var signoutFcnsArr = [];
    _.each(agents, function(eachAgent, index) {
      signoutFcnsArr.push(function(callback2) {
        var req = request(meanlocalauthUrl).post('/api/signout');
        eachAgent.attachCookies(req);
        req.send({}); // the sending of the JSON must come after the attachment of the cookies
        req.end(function(err, res) {
          if (err) { throw err; }
          callback2(null);
        });
      });
    });
    async.parallel(signoutFcnsArr, function(err, results) {
      if (err) {
        callback(err);
      } else {
        callback();
      }
    });
    // sign out both agent and agent2, i.e. loop through both
  } else {
    var req = request(meanlocalauthUrl).post('/api/signout');
    agents.attachCookies(req);
    req.send({}); // the sending of the JSON must come after the attachment of the cookies
    req.end(function(err, res) {
      if (err) { throw err; }
      callback();
    });
  }
};

// If you are using a self-signed SSL certificate, uncomment the below:
// exports.init = function() {
//   process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
//   // This is necessary for testing purposes so that we can use a self-signed
//   // certificate with our testing suite. Otherwise node gives
//   // Uncaught Error: DEPTH_ZERO_SELF_SIGNED_CERT
//   // Cf. http://stackoverflow.com/questions/19816689/nodejs-supertest-testing-routes-with-certificates
// };
