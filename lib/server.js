var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var RedisStore = require('connect-redis')(session);

var config = require('./config/config.json');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../public/views'));
app.engine('html', require('ejs').renderFile); // We use the ejs engine to serve regular HTML
app.set('view engine', 'html');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// Enable sessions
app.use(cookieParser(config.secrets.cookieParser));
app.use(session({
  store: new RedisStore({
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.dbs.session,
    pass: config.redis.pass
  }),
  secret: config.secrets.session,
  cookie: {
    path: '/',
    maxAge: 36000000,
    httpOnly: true,
    secure: true
  },
  proxy: true // necessary for the session middleware to trust the nginx server in setting secure cookies
}));

// Add passport.js middleware - note this must be done after enabling the session middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../public')));

// Configure environment

// Connect to Mongo db

//var db =
require('./config/db.js')();


// Add custom authentication middleware

//var authMiddleware =
require('./config/authMiddleware.js')(app);


// Routes

// Include core routes
//var routes =
require('./routes/routes.js')(app);
// Add password reset routes
//var passwordResetMiddleware =
require('./routes/passwordReset.js')(app);

module.exports = app;
