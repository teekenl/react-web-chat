'use strict';

var socketService = require('./socket-service');
var users = {};

var self = module.exports = {
    verifySession: function(req, res) {
        var userName = req.session.username;
        if(userName && !user[userName]) {
            users[userName] = { userName: userName};
            res.send({sessionVerified: true, user: users[userName]});
        }
        else {
            if(users[userName]) {
                req.session.userName = "";
                res.send({sessionVerified: false});
            }
        }
    },
    register: function(req, res) {
        var userName = req.body.username;
        if(user[userName]) {
            res.send({membershipResolved: false, error: "User already exits"});
        }
        users[userName] = {userName: userName};
        req.session.username = userName;
        res.send({membershipResolved: true, user: users[userName]});
    },
    unregister: function(userName) {
        delete users[userName];
    },
    getUser: function(userName) {
        return users[userName];
    },
    getAllUsers: function(){
        return users;
    },
    renameUser: function(oldUsername, newUsername) {
        var user = self.getUser(oldUsername);
        user.userName = newUsername;
        users[newUsername] = user;
        self.unregister(oldUsername);
    }

};