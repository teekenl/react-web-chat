var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var config = require('./config.js');
var socket = require('./routes/socket.js');

// Setup redis client
var redis = require('redis');
var redisClient = redis.createClient();
var RedisStore = require('connect-redis')(session);
var redisStore = new RedisStore({ client: redisClient });
var sessionService = require('./routes/session-service');
sessionService.initializedRedis(redisClient, redisStore);

// Require module or libraries to connect mLab
var mongoose = require('mongoose');
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

var mongoUri =  'mongodb://kenlau95:noob950314@ds129153.mlab.com:29153/capitaldb';
mongoose.connect(mongoUri,options,function(err) {
    if(err) {
        return console.log("The mLab connection url is wrong or invalid");
    }
    return console.log("The mLab connection is established");
});

var db = mongoose.connection;

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res, next){
    req.db = db;
    next();
});

//Enable CORs
var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allowedCORSOrigins);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
};

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.sessionSecret));
app.use(session({ store: redisStore, key: config.sessionCookieKey, secret: config.sessionSecret, resave: true, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(allowCrossDomain());

// deprecated.
/*
io.configure(function(){
    var parseCookie = cookieParser(config.sessionSecret);
    io.set('authorization', function(handshake, callback) {
        parseCookie(handshake,null,function(err,data) {
            if(err)
                return callback(err.message,false);
            if(!session)
                return callback("Not authorized", false);
            handshake.session = session;
            callback(null,true);
        })
    })
});
*/

io.use(function(socket,next){
    var parseCookie = cookieParser(config.sessionSecret);
    var handshake = socket.request;
    parseCookie(handshake,null,function(err,data) {
        if(err)
            next(new Error(err.message));
        if(!session)
            next(new Error('Not authorized'));
        handshake.session = session;
        next();
    })
});

io.on('connection', function(socket){
    // put socket route here.
});


app.use('/', index);
app.use('/users', users);

// Handle the establishment of socket connection in back-end server
io.sockets.on('connection',socket);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app:app, server: server};
