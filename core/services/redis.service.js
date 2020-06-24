var celery = require('node-celery');
var config = require('../config').config();

exports.reparseDb =  async () => {
    return new Promise((resolve, reject) => {
        client = celery.createClient({ CELERY_BROKER_URL: config.redis.host });
        client.on('error', function (err) {
            console.log(err);
            reject(err);
        });
        client.on('connect', function () {
            var result = client.call('dbreparser', []);
            resolve(result);
        });
    });
}

exports.parse =  async (resumeId) => {
    return new Promise((resolve, reject) => {
        client = celery.createClient({ CELERY_BROKER_URL: config.redis.host });
        client.on('error', function (err) {
            console.log('redis error : ', err);
            reject(err);
        });
        client.on('connect', function () {
            console.log('redis connect ');
            var result = client.call('dbparser', [resumeId]);
            resolve(result);
        });
    });
}