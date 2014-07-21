'use strict';

// If you are using a self-signed SSL certificate, uncomment this line:
// require('./config.js').init();

var request = require('supertest');
var superagent = require('superagent');
var expect = require('expect.js');
var mongoose = require('mongoose');

var dbClient = require('./config.js').dbClient;
var config = require('./config.js').config;
var meanlocalauthUrlInsecure = require('./config.js').meanlocalauthUrlInsecure;
var meanlocalauthUrl = require('./config.js').meanlocalauthUrl;
var dbConnUrl = require('./config.js').dbConnUrl;

// test user
var testUser = require('./config.js').testUser;

// create agent whose cookies we can save, for use with route that requires authentication
// i.e. in order to test that we are successfully authenticated after signup
// we define this agent in the global scope relative to our tests
// so that we can access it in both the /signup and /signin sections
var agent = superagent.agent();

describe('POST /api/signup', function() {

  before(function(done) {
    this.timeout(20e3);

    // Connect to dev db so that we can do custom manipulations of db to prepare our tests
    mongoose.connect(dbConnUrl, function(err) {
      if (err) throw err;
      console.log('Successfully connected to MongoDB');
      // delete the testUser user
      dbClient.deleteUser(testUser.username, function(err) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
    });
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
  });

  after(function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signout');
    agent.attachCookies(req);
    req.send({}); // the sending of the JSON must come after the attachment of the cookies
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      done();
    });
  })

  it("should return 301 and redirect to HTTPS if connecting over port 80", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrlInsecure).post('/api/signup');
    req.send({
      // we deliberately leave this a bad request so that we don't actually create a user
      // during this step
      email: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(301);
      expect(res.header['location']).to.eql('https://' + config.publicDNS + '/api/signup')
      done();
    });
  });

  it("should return 400 if no username provided", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      email: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should return 400 if no email provided", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: testUser.username,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should return 400 if no password provided", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: testUser.username,
      email: testUser.email
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should return 400 if a username does not contain only alphanumeric characters or dashes", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: 'asdf/asdf',
      email: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should return 400 if a username's first character is a dash", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: '-blahblah',
      email: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should return 400 if a username that is 26 characters is provided", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: 'aaaaaaaaaaaaaaaaaaaaaaaaaa',
      email: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should return 400 if a username that looks like an email address is provided", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: testUser.email,
      email: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      // Note this 400 is actually coming from the validation that a username
      // contain only alphanumeric characters and non-leading dashes
      // since that validation is performed prior to the non-email username validation
      // and since any email address contains @
      done();
    });
  });

  it("should return 400 if an invalid email address is provided", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: testUser.username,
      email: 'test@test',
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should return 400 if password fewer than 8 characters is provided", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: testUser.username,
      email: testUser.email,
      password: 'Invpas1'
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should return 400 if password does not contain a numeral", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: testUser.username,
      email: testUser.email,
      password: 'Invpasss'
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should return 400 if password does not contain an uppercase letter", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: testUser.username,
      email: testUser.email,
      password: 'invpasss1'
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should return 200 for successful signup", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: testUser.username,
      email: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      agent.saveCookies(res.res);
      done();
    });
  });

  it("should return 409 if username is taken", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: testUser.username,
      email: 'differentemail@example.com',
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(409);
      done();
    });
  });

  it("should return 400 if email address is already in use", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signup');
    req.send({
      username: 'differentuser',
      email: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should authenticate the user after successful signup", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).get('/api/is_authenticated');
    agent.attachCookies(req);
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.key('username');
      expect(res.body).to.have.key('status');
      expect(res.body.status).to.eql(true);
      expect(res.body.username).to.eql(testUser.username);
      // TODO - also expect a user cookie to come with this response
      done();
    });
  });

});

describe('POST /api/signin', function() {

  before(function(done) {
    this.timeout(20e3);
    // make sure the testUser is not signed in at the time we make these signin attempts
    var req = request(meanlocalauthUrl).post('/api/signout');
    agent.attachCookies(req);
    req.send({}); // the sending of the JSON must come after the attachment of the cookies
    req.end(function(err, res) {
      if (err) throw err;
      done();
    });
  });

  beforeEach(function(done) {
    // create a new agent for each test, which will then be signed out after each test
    agent = superagent.agent();
    done();
  });

  afterEach(function(done) {
    this.timeout(20e3);
    // sign the testUser out after each test--this ensures that we are testing signin fresh every time
    var req = request(meanlocalauthUrl).post('/api/signout');
    agent.attachCookies(req);
    req.send({}); // the sending of the JSON must come after the attachment of the cookies
    req.end(function(err, res) {
      if (err) throw err;
      done();
    });
  })

  it("should reject a signin attempt for a username who doesn't exist", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signin');
    req.send({
      username: 'fake-user',
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(401);
      done();
    });
  });

  it("should reject a signin attempt for an email address that doesn't exist", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signin');
    req.send({
      username: 'fakeuser@fakeuser.com',
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(401);
      done();
    });
  });

  it("should reject a signin attempt with an incorrect password", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signin');
    req.send({
      username: testUser.username,
      password: 'incorrectPassword1'
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(401);
      done();
    });
  });

  it("should allow successful login with a username", function(done) {
    this.timeout(40e3);
    var req = request(meanlocalauthUrl).post('/api/signin');
    req.send({
      username: testUser.username,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      agent.saveCookies(res.res);
      // note that the logic below checking that user is authenticated is
      // a duplicate of code in the /signup section
      var req2 = request(meanlocalauthUrl).get('/api/is_authenticated');
      agent.attachCookies(req2);
      req2.end(function(err2, res2) {
        if (err2) throw err2;
        expect(res2.status).to.eql(200);
        expect(res2.body).to.be.an('object');
        expect(res2.body).to.have.key('username');
        expect(res2.body).to.have.key('status');
        expect(res2.body.status).to.eql(true);
        expect(res2.body.username).to.eql(testUser.username);
        // TODO - also expect a user cookie to come with this response
        done();
      });
    });
  });

  it("should allow successful login with an email address", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signin');
    req.send({
      username: testUser.email,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      agent.saveCookies(res.res);
      // note that the logic below checking that user is authenticated is
      // a duplicate of code in the /signup section
      var req2 = request(meanlocalauthUrl).get('/api/is_authenticated');
      agent.attachCookies(req2);
      req2.end(function(err2, res2) {
        if (err2) throw err2;
        expect(res2.status).to.eql(200);
        expect(res2.body).to.be.an('object');
        expect(res2.body).to.have.key('username');
        expect(res2.body).to.have.key('status');
        expect(res2.body.status).to.eql(true);
        expect(res2.body.username).to.eql(testUser.username);
        // TODO - also expect a user cookie to come with this response
        done();
      });
    });
  });

});

describe('POST /api/signout', function() {

  before(function(done) {
    this.timeout(20e3);
    // make sure testUser is signed in
    agent = superagent.agent();
    var req = request(meanlocalauthUrl).post('/api/signin');
    req.send({
      username: testUser.username,
      password: testUser.password
    });
    req.end(function(err, res) {
      if (err) throw err;
      agent.saveCookies(res.res);
      done();
    });
  });

  it("should successfully signout an authenticated user", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signout');
    agent.attachCookies(req);
    req.send({}); // the sending of the JSON must come after the attachment of the cookies
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      done();
    });
  });

  it("should reject a signout attempt for a user who exists but isn't authenticated, namely the user signed out in previous test", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/signout');
    agent.attachCookies(req);
    req.send({});
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(401);
      done();
    });
  });
});

describe('POST /api/forgot_password', function() {
  beforeEach(function(done) {
    agent = superagent.agent();
    done();
  });

  it("should reject a forgot_password attempt for an email that doesn't exist", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/forgot_password');
    req.send({
      email: 'fake-email@fake.com'
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should reject an 'email' that isn't a well-formed email address", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/forgot_password');
    req.send({
      email: 'fake-email@invalid'
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should successfully send a reset email and redirect to the change-password page", function(done) {
    this.timeout(20e3);
    // TODO - not sure how to successfully test this sending of an email
    done();
  });
});

describe('POST /api/reset_password', function() {
  before(function(done) {
    this.timeout(20e3);
    agent = superagent.agent();
    var req = request(meanlocalauthUrl).post('/api/forgot_password');
    req.send({
      email: config.testing.email
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      agent.saveCookies(res.res);
      done();
    });
  });

  it("should reject a request for which a reset token hasn't been set", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/reset_password');
    // by not attaching any cookies, we ensure that from the server's point of view the user is a
    // new session who has not requested a reset
    req.send({
      password: 'blahblah',
      confirm: 'blehbleh'
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should reject passwords that don't match", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/reset_password');
    agent.attachCookies(req);
    req.send({
      password: 'Validpass1',
      confirm: 'Validpass2'
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should reject a password that doesn't meet the requirements", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/reset_password');
    agent.attachCookies(req);
    req.send({
      password: 'invalidpass',
      confirm: 'invalidpass'
    });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(400);
      done();
    });
  });

  it("should successfully reset a password such that user can login with the new password", function(done) {
    this.timeout(20e3);
    // TODO - not sure how to successfully test this, because it requires using a key sent in the email
    done();
  });
});

describe('POST /api/check/username', function() {
  before(function(done) {
    this.timeout(20e3);
    done();
  });

  it("should return { isUnique: false } for a taken username", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/check/username');
    req.send({ field: testUser.username });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      expect(res.body).to.have.key('isUnique');
      expect(res.body.isUnique).to.eql(false);
      done();
    });
  });

  it("should return { isUnique: true } for an available username", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/check/username');
    req.send({ field: 'availableUser' });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      expect(res.body).to.have.key('isUnique');
      expect(res.body.isUnique).to.eql(true);
      done();
    });
  });
});

describe('POST /api/check/email', function() {
  before(function(done) {
    this.timeout(20e3);
    done();
  });

  it("should return { isUnique: false } for an email that is already in use", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/check/email');
    req.send({ field: testUser.email });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      expect(res.body).to.have.key('isUnique');
      expect(res.body.isUnique).to.eql(false);
      done();
    });
  });

  it("should return { isUnique: true } for an email that can be used", function(done) {
    this.timeout(20e3);
    var req = request(meanlocalauthUrl).post('/api/check/email');
    req.send({ field: 'available@email.com' });
    req.end(function(err, res) {
      if (err) throw err;
      expect(res.status).to.eql(200);
      expect(res.body).to.have.key('isUnique');
      expect(res.body.isUnique).to.eql(true);
      done();
    });
  });
});
