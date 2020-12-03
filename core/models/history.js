var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var historySchema = new Schema({
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'Applicants'
    },
    pipeline: {
        type: Schema.Types.ObjectId,
        ref: 'JobPipelines'
    },
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Jobs'
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: {type: Date, default: Date.now},
    modified_at: {type: Date, default: Date.now},
    is_deleted: Boolean
}, { versionKey: false });
historySchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
historySchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
historySchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var History = mongoose.model('History', historySchema);
module.exports = History;