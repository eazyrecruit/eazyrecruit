var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jobApplicantSchema = new Schema({
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'Applicants'
    },
    pipeline: {
        type: Schema.Types.ObjectId,
        ref: 'JobPipelines'
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
jobApplicantSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
jobApplicantSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
jobApplicantSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
module.exports = mongoose.model('JobApplicants', jobApplicantSchema);