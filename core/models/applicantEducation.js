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
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: {type: Date, default: Date.now},
    modified_at: {type: Date, default: Date.now}
}, { versionKey: false });
applicantEducationSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
applicantEducationSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
applicantEducationSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var ApplicantEducations = mongoose.model('ApplicantEducations', applicantEducationSchema);
module.exports = ApplicantEducations;