var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var employerSchema = new Schema({
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
employerSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
employerSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
employerSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var Employers = mongoose.model('Employers', employerSchema);
module.exports = Employers;