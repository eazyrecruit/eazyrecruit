var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var employerSchema = new Schema({
    name: String,
    website: Date,
    email: Date,
    phone: Array,
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address'
    },
    is_deleted: Boolean,
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: Date,
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    modified_at: Date
}, { versionKey: false });

var Employers = mongoose.model('Employers', employerSchema);
module.exports = Employers;