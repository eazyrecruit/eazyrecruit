var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var applicantEmploymentSchema = new Schema({
    title: String,
    responsibility: String,
    start: Date,
    end: Date,
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'Applicants'
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Employers'
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

var ApplicantEmployments = mongoose.model('ApplicantEmployments', applicantEmploymentSchema);
applicantEmploymentSchema.virtual('dateValidator').get(function () {
    if (this.end === 'present') {
        return new Date();
    }
});
module.exports = ApplicantEmployments;