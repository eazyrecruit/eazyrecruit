var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var interviewCriteriaSchema = new Schema({
    name: String,
    industry: {
        type: Schema.Types.ObjectId,
        ref: 'Industries'
    },
    technology: {
        type: Schema.Types.ObjectId,
        ref: 'Technologies'
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
interviewCriteriaSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
interviewCriteriaSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
interviewCriteriaSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var InterviewCriterias = mongoose.model('InterviewCriterias', interviewCriteriaSchema);
module.exports = InterviewCriterias;