var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var log = new Schema({
        groupName: {type: String},
        data: [{
            title: {type: String},
            message: {type: String}
        }],
    created_at: {type: Date, default: Date.now},
    modified_at: {type: Date, default: Date.now}
})
log.pre('save', function (next) {
    this.modified_at = new Date;
    return next();
});
log.pre('updateOne', function (next) {
    this.modified_at = new Date;
    return next();
});
log.pre('update', function (next) {
    this.modified_at = new Date;
    return next();
});
module.exports = mongoose.model('Logs', log);