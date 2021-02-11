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
    score: {type: Number, default: 0},
    channelProperty: {type: Object, default: {}},
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
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: {type: Date, default: Date.now},
    modified_at: {type: Date, default: Date.now}
}, {
    versionKey: false
});
interview.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
interview.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
interview.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var Interviews = mongoose.model('Interviews', interview);
module.exports = Interviews;
