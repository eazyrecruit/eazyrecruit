var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var socialSchema = new Schema({
    name: String,
    url:String,
    logo: String,
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
socialSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
socialSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
socialSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var Socials = mongoose.model('Socials',socialSchema);
module.exports = Socials;