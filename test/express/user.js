'use strict';

// If you are using a self-signed SSL certificate, uncomment this line:
// require('./config.js').init();

var request = require('supertest');
var superagent = require('superagent');
var expect = require('expect.js');

var meanlocalauthUrl = require('./config.js').meanlocalauthUrl;

var testUser = require('./config.js').testUser;
var testUser2 = require('./config.js').testUser2;

describe('GET /api/users/:username', function() {

  it("should return public info only to unauthenticated user", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).get('/api/users/' + testUser.username);
    req.end(function(err, res) {
      if (err) { throw err; }
      expect(res.status).to.eql(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.key('data');
      expect(res.body.data).to.eql('Public info for user ' + testUser.username + ' here');
      done();
    });
  });

  it("should return public info only to authenticated user who is not the queried user", function(done) {
    this.timeout(20e3);
    var agent = superagent.agent();
    var req = request(meanlocalauthUrl).post('/api/signin');
    req.send({
      username: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) { throw err; }
      expect(res.status).to.eql(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.key('username');
      expect(res.body.username).to.eql(testUser.username);
      agent.saveCookies(res.res);
      var req2 = request(meanlocalauthUrl).get('/api/users/' + testUser2.username);
      agent.attachCookies(req2);
      req2.end(function(err2, res2) {
        if (err2) { throw err2; }
        expect(res2.status).to.eql(200);
        expect(res2.body).to.be.an('object');
        expect(res2.body).to.have.key('data');
        expect(res2.body.data).to.eql('Public info for user ' + testUser2.username + ' here');
        done();
      });
    });
  });

  it("should return public and private info to authenticated user who is the queried user", function(done) {
    this.timeout(20e3);
    var agent = superagent.agent();
    var req = request(meanlocalauthUrl).post('/api/signin');
    req.send({
      username: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) { throw err; }
      expect(res.status).to.eql(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.key('username');
      expect(res.body.username).to.eql(testUser.username);
      agent.saveCookies(res.res);
      var req2 = request(meanlocalauthUrl).get('/api/users/' + testUser.username);
      agent.attachCookies(req2);
      req2.end(function(err2, res2) {
        if (err2) { throw err2; }
        expect(res2.status).to.eql(200);
        expect(res2.body).to.be.an('object');
        expect(res2.body).to.have.key('data');
        expect(res2.body.data).to.eql('Public and private (i.e. authentication-required) info for user ' +
          testUser.username + ' here');
        done();
      });
    });
  });
});
