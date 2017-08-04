var crypto = require('crypto');

var Saltlength = 9;


function createHash(password) {
    var salt = generateSalt(Saltlength);
    var hash = md5(password + salt);
    return salt + hash;
}

function validateHash(hash,password){
    var salt = hash.substr(0,Saltlength);
    var validateHash = salt + md5(password + salt);

    return hash === validateHash;
}

function generateSalt(len){
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
        setLen = set.length,
        salt = '';

    for(var i = 0; i<len;i++) {
        var p = Math.floor(Math.random() * setLen);
        salt += set[p];
    }
    return salt;
}

function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

module.export = {
    'createHash' : createHash(),
    'validateHash' :  validateHash()
};