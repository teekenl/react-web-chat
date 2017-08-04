var express = require('express');
var router = express.Router();
var passwordHash = require('../routes/password');

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', { title: 'Express' });
  res.io.sockets.on('connection',function(socket){
      //Establishment of connection
      console.log("The socket connection is established");

      socket.emit('connect',{
          "socket_message" : "You have now connected to chat room"
      });
      socket.emit('connectToUser',"You have now connected to the chat room");

      socket.on('sendMessage',function(data){
         console.log(data);
      });

      socket.on('disconnect',function(data){
          console.log("User is disconnected");
      });
  });

});


router.get('/chat',function(req, res, next) {
    res.render('chat',{title: 'Express'});
});

module.exports = router;
