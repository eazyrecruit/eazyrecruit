var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var activitySchema = new Schema({
    comment: String,
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

var Activities = mongoose.model('Activities', activitySchema);

module.exports = Activities;