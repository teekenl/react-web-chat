var express = require('express');
var router = express.Router();
var passwordHash = require('../routes/password');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/index',function(req, res, next) {
    res.render('index',{title:'Express'});
});

router.get('/chat',function(req, res, next){
    if(!req.session.authenticated) {
        res.redirect('/login');
    } else{
        res.render('chat',{title: 'Chat'});
    }
});

router.get('/login',function(req, res, next) {
   res.render('login',{title: 'Login'});
});

router.get('/logout',function(req,res,next) {
    if(req.session.authenticated){
        // Unset session if user has logged out
        req.session = null;
    }
    res.redirect('/');
});

router.get('/signup',function(req, res, next) {
   res.render('signup',{title: 'Sign Up'});
});

router.post('/verifyUser',function(req, res, next) {
   var username = req.body.username;
   var password = req.body.password;
   var db = req.db;
   var collection = db.collection('chat_user_collection');

   collection.findOne(
       { username:username.toString()
       },
         function(err,document) {
           if(err) {
               res.send("There is a problem with retrieving information. Please try it agian.");
           } else{
               if(document) {
                   if(passwordHash.validateHash(document.password,password.toString())){
                       // If the user has provided right information
                       req.session.user = document.username;
                       req.session.id = document._id;
                       req.session.authenticated = true;
                       res.redirect('/chat');
                   } else{
                       res.redirect('/login');
                   }
               } else{
                   // No such user
                   res.redirect('/login');
               }
           }
         }
       )
});

router.post('/validateUser',function(req,res,next) {
   var username = req.body.username,
       userpassword = req.body.password,
       useremail = req.body.useremail;

   var db = req.db;
   var collection = db.collection('chat_user_collection');

   collection.insert({
       "username": username,
       "password": passwordHash.createHash(userpassword.toString()),
       "useremail": useremail
   }, function(err, document) {
       if(err) {
           res.send("There is a problem with adding user information. Please try it again.");
       }
       res.redirect('/login');
   })
});

module.exports = router;
