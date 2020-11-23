var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var addressesSchema = new Schema({
    country:String,
    city:String,
    state:String,
    zip: String,
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
addressesSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
addressesSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
addressesSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
module.exports = mongoose.model('Locations',addressesSchema);