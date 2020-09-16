var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jobApplicantSchema = new Schema({
    applicant: {
        type:Schema.Types.ObjectId,
        ref:'Applicants'
    },
    pipeline: {
        type:Schema.Types.ObjectId,
        ref:'JobPipelines'
    },
    job: {
        type:Schema.Types.ObjectId,
        ref:'Jobs'
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

module.exports = mongoose.model('JobApplicants', jobApplicantSchema);