var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var applicantEducationSchema = new Schema({
    name: String,
    start: Date,
    end: Date,
    institute: {
        type: Schema.Types.ObjectId,
        ref: 'Institutes'
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

var ApplicantEducations = mongoose.model('ApplicantEducations', applicantEducationSchema);
module.exports = ApplicantEducations;