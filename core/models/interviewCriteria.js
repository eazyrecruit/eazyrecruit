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
    created_at: Date,
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    modified_at: Date
}, { versionKey: false });

var InterviewCriterias = mongoose.model('InterviewCriterias', interviewCriteriaSchema);
module.exports = InterviewCriterias;