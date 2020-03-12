var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var interviewModeSchema = new Schema({
    name: String,
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

module.exports = mongoose.model('InterviewModes', interviewModeSchema);