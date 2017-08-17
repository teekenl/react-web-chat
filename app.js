var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var RedisStore = require("connect-redis")(session);
var socket = require('./routes/socket.js');

// Require module or libraries to connect mLab
var mongoose = require('mongoose');
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

var sessionMiddleware = session({
    store: new RedisStore({}), // XXX redis server config
    secret: "random........."
});

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
var io = require('socket.io')(server);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

io.use(function(socket, next){
    sessionMiddleware(socket.request,socket.request.res, next);
});

app.use(function(req, res, next){
    req.db = db;
    next();
});

app.use(sessionMiddleware);

// Handle the establishment of socket connection in back-end server
io.sockets.on('connection',socket);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:"ui2hf893hf232ofn3023fp",resave:false,saveUninitialised:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

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
