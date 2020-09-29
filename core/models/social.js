var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var socialSchema = new Schema({
    name: String,
    url:String,
    logo: String,
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

var Socials = mongoose.model('Socials',socialSchema);
module.exports = Socials;