// var crypto = require('crypto');
var config = require('../config').config();
// var iv = new Buffer(config.encrypt.iv);
// var key = new Buffer(config.encrypt.key);

// exports.encrypt = async (string_to_encrypt) => {
//     try {
//         var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
//         cipher.update(new Buffer(string_to_encrypt));
//         return cipher.final('base64');    
//     } catch (error) {
//         return error;
//     }
// }

// exports.decrypt = async (encrypted_string) => {
//     try {
//         let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
//         decipher.update(encrypted_string, 'base64', 'utf8');
//         return decipher.final('utf8');        
//     } catch (error) {
//         return error;
//     }

// }

const crypto = require('crypto');
const ENC_KEY = config.encrypt.key; // set random encryption key
const IV = config.encrypt.iv; // set random initialisation vector
// ENC_KEY and IV can be generated as crypto.randomBytes(32).toString('hex');

exports.encrypt = ((val) => {
  let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(val, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
});

exports.decrypt = ((encrypted) => {
  let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  return (decrypted + decipher.final('utf8'));
});