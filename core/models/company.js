var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var company= new Schema({
    name: { type: String, unique: true },
    website: {type: String},
    address_line_1: {type: String},
    address_line_2: {type: String},
    address_line_3: {type: String},
    email: {type: String},
    phone: {type: String},
    is_deleted: {type: Boolean, default: false },
    created_by: {type: Number},
    created_at: { type: Date, default: Date.now },
    modified_by: {type: Number},
    modified_at: { type: Date, default: Date.now },
    groupName: [{
        type: String
    }]
});

module.exports = mongoose.model('Companies', company);