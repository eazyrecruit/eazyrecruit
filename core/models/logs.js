var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
 
var logs = new Schema({
    id:ObjectId,
    log_type: String,
    user_id: Number,
    log_data: Object,
    created_date: { type: Date, default: Date.now },
    modified_date: { type: Date, default: Date.now },
    is_deleted: Boolean
}, { versionKey: false });
logs.pre('save', function (next) {
    this.modified_date = new Date;
    return next();
});
logs.pre('updateOne', function (next) {
    this.modified_date = new Date;
    return next();
});
logs.pre('update', function (next) {
    this.modified_date = new Date;
    return next();
});
module.exports = mongoose.model('logs', logs);