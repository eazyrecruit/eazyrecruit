var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var activitySchema = new Schema({
    title: String,
    description: String,
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'Applicants'
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: {type: Date, default: Date.now},
}, {versionKey: false});
var Activities = mongoose.model('Activities', activitySchema);

module.exports = Activities;