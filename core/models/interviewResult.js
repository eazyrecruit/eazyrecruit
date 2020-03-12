var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var interviewResultSchema = new Schema({
    interview: {
        type:Schema.Types.ObjectId,
        ref:'Interviews'
    },
    criteria: {
        type:Schema.Types.ObjectId,
        ref:'InterviewCriterias'
    },
    score: Number,
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
}, {
    versionKey: false
});

module.exports = mongoose.model('InterviewResults', interviewResultSchema);
