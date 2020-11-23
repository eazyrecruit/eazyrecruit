var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var instituteSchema = new Schema({
    name: String,
    website: Date,
    email: Date,
    phone: Array,
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address'
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
instituteSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
instituteSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
instituteSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var Institutes = mongoose.model('Institutes', instituteSchema);
module.exports = Institutes;