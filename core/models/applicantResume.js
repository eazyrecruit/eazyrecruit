var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var applicantResumeSchema = new Schema({
    resume:String,
    fileName: String,
    fileType: String,
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
applicantResumeSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
applicantResumeSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
applicantResumeSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var ApplicantResumes = mongoose.model('ApplicantResumes',applicantResumeSchema);
module.exports = ApplicantResumes;