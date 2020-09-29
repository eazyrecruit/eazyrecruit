var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var log = new Schema({
        groupName: {type: String},
        data: [{
            title: {type: String},
            message: {type: String}
        }]
})

module.exports = mongoose.model('Logs', log);