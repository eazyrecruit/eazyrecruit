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
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: {type: Date, default: Date.now},
    modified_at: {type: Date, default: Date.now}
}, { versionKey: false });
applicantEmploymentSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
applicantEmploymentSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
applicantEmploymentSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var ApplicantEmployments = mongoose.model('ApplicantEmployments', applicantEmploymentSchema);
applicantEmploymentSchema.virtual('dateValidator').get(function () {
    if (this.end === 'present') {
        return new Date();
    }
});
module.exports = ApplicantEmployments;