var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var applicantCommentSchema = new Schema({
    comment: String,
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'Applicants'
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

module.exports = mongoose.model('ApplicantComments', applicantCommentSchema);