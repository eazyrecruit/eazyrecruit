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
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: {type: Date, default: Date.now},
    modified_at: {type: Date, default: Date.now}
}, {
    versionKey: false
});
interviewResultSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
interviewResultSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
interviewResultSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
module.exports = mongoose.model('InterviewResults', interviewResultSchema);
