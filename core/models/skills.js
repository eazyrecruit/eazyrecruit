var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var skillsSchema = new Schema({
    name: String,
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
skillsSchema.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
skillsSchema.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
skillsSchema.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
var Skills = mongoose.model('Skills', skillsSchema);
module.exports = Skills;