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
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: {type: Date, default: Date.now},
    modified_at: {type: Date, default: Date.now}
}, {versionKey: false});
jobPipelineSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
jobPipelineSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
jobPipelineSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
module.exports = mongoose.model('JobPipelines', jobPipelineSchema);