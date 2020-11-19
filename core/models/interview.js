var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var interview = new Schema({
    uid: String,
    sequence: Number,
    status: String,
    start: Date,
    end: Date,
    note: String,
    channel: String,
    channelLink: String,
    comment: String,
    round: String,
    score: { type: Number, default: 0 },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Jobs'
    },
    jobApplicant: {
        type: Schema.Types.ObjectId,
        ref: 'JobApplicants'
    },
    interviewer: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    organizer: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    result: String,
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
}, {
    versionKey: false
});

var Interviews = mongoose.model('Interviews', interview);
module.exports = Interviews;
