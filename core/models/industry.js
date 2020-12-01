var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var industrySchema = new Schema({
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
industrySchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
industrySchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
industrySchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var Industries = mongoose.model('Industries', industrySchema);
module.exports = Industries;