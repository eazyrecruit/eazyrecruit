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
    created_at: Date,
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    modified_at: Date
}, { versionKey: false });

var ApplicantResumes = mongoose.model('ApplicantResumes',applicantResumeSchema);
module.exports = ApplicantResumes;