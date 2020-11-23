var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var applicantCommentSchema = new Schema({
    comment: String,
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'Applicants'
    },
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Jobs'
    },
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
}, {versionKey: false});
applicantCommentSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
applicantCommentSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
applicantCommentSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
module.exports = mongoose.model('ApplicantComments', applicantCommentSchema);