'use strict';
var sockets = [];
module.exports = {
    get: function(username) {
        return socket[username];
    },
    set: function(username,socket) {
        sockets[username] = socket;
    },
    remove: function(username) {
        delete sockets[username];
    }
};