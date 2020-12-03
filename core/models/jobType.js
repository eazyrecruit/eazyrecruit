var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jobTypeSchema = new Schema({
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
jobTypeSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
jobTypeSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
jobTypeSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
module.exports = mongoose.model('JobTypes', jobTypeSchema);