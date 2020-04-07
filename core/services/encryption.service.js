var crypto = require('crypto');
var config = require('../config').config();
var iv = new Buffer(config.encrypt.iv);
var key = new Buffer(config.encrypt.key);

exports.encrypt = async (string_to_encrypt) => {
    try {
        var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        cipher.update(new Buffer(string_to_encrypt));
        return cipher.final('base64');    
    } catch (error) {
        return error;
    }
}

exports.decrypt = async (encrypted_string) => {
    try {
        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        decipher.update(encrypted_string, 'base64', 'utf8');
        return decipher.final('utf8');        
    } catch (error) {
        return error;
    }

}