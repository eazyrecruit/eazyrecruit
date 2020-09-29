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
    created_at: Date,
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    modified_at: Date
}, { versionKey: false });

var ApplicantSocial = mongoose.model('ApplicantSocials',userSocialSchema);
module.exports = ApplicantSocial;