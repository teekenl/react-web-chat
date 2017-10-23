var config = require('../config');

var redisClient = null;
var redisStore = null;

var self = module.exports = {
    initializedRedis: function(client, store) {
        redisClient = client;
        redisStore = store;
    },
    getSessionId: function(handshake) {
        return handshake.signedCookies[config.sessionCookieKey];
    },
    get: function(handshake, callback) {
        var sessionId = self.getSessionId(handshake);
        self.getSessionBySessionId(sessionId, function(err,session) {
            if(err) callback(err);
            if(callback!==undefined) {
                callback(null,session);
            }
        });
    },
    getSessionBySessionId: function(sessionId,callback) {
        redisStore.load(sessionId,function(err,session) {
            if(err) callback(err);
            if(callback!==undefined) {
                callback(null, session);
            }
        });
    },
    getUsername: function(handshake, callback) {
        self.get(handshake,function(err,session) {
            if(err) callback(err);
            if(session)
                callback(null,session);
            else callback(null);
        });
    },
    updateSession: function(session,callback) {
        try{
            session.reload(function(){
                session.touch().save();
                callback(null,session);
            })
        }
        catch(err) {
            callback(err);
        }
    },
    setSessionProperty: function(session, propertyName, propertyValue, callback) {
        session[propertyName] = propertyValue;
        self.updateSession(session,callback);
    }
};