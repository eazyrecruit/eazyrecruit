var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySetting = new Schema({
        groupName: {type: String},
        key: {type: String},
        value: {type: String},
        companyId: {type: String},
        created_at: {type: Date, default: Date.now},
        modified_at: {type: Date, default: Date.now}
})
companySetting.pre('save', function (next) {
        this.modified_at = new Date;
        return next();
});
companySetting.pre('updateOne', function (next) {
        this.modified_at = new Date;
        return next();
});
companySetting.pre('update', function (next) {
        this.modified_at = new Date;
        return next();
});
module.exports = mongoose.model('companysettings', companySetting);