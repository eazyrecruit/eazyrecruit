var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var jobMetaImageSchema = new Schema({
    image: String,
    fileName: String,
    fileType: String,
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
jobMetaImageSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
jobMetaImageSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
jobMetaImageSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var JobMetaImage = mongoose.model('JobMetaImages', jobMetaImageSchema);
module.exports = JobMetaImage;