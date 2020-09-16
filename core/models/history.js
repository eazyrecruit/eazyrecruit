var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var historySchema = new Schema({
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'Applicants'
    },
    pipeline: {
        type: Schema.Types.ObjectId,
        ref: 'JobPipelines'
    },
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Jobs'
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: Date,
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    modified_at: Date,
    is_deleted: Boolean
}, { versionKey: false });

var History = mongoose.model('History', historySchema);
module.exports = History;