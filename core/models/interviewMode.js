var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var interviewModeSchema = new Schema({
    name: String,
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
interviewModeSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
interviewModeSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
interviewModeSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
module.exports = mongoose.model('InterviewModes', interviewModeSchema);