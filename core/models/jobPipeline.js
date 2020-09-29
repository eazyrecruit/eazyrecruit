var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jobPipelineSchema = new Schema({
    name: String,
    position: Number,
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

module.exports = mongoose.model('JobPipelines', jobPipelineSchema);