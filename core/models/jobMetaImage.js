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
    created_at: Date,
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    modified_at: Date
}, { versionKey: false });

var JobMetaImage = mongoose.model('JobMetaImages', jobMetaImageSchema);
module.exports = JobMetaImage;