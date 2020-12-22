var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var activitySchema = new Schema({
    comment: String,
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


activitySchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
activitySchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
activitySchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var Activities = mongoose.model('Activities', activitySchema);

module.exports = Activities;