var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String},
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'Applicants'
    },
    targetDate: {type: Date, default: Date.now},
    completionDate: {type: Date},
    status: {type: String, default: "ACTIVE", enum: ["ACTIVE", "COMPLETED"]},
    isDeleted: {type: Boolean, default: false},
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    modifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    modifiedOn: {type: Date, default: Date.now},
    createdOn: {type: Date, default: Date.now}
}, {collection: "tasks", versionKey: false});

taskSchema.pre('update', function save(next) {
    this.modifiedOn = Date.now;
    return next();
});
module.exports = mongoose.model('tasks', taskSchema);
