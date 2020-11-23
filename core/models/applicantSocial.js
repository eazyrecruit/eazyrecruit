var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var userSocialSchema = new Schema({
    profileUrl:String,
    social: {
        type: Schema.Types.ObjectId,
        ref: 'Socials'
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
userSocialSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
userSocialSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
userSocialSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var ApplicantSocial = mongoose.model('ApplicantSocials',userSocialSchema);
module.exports = ApplicantSocial;