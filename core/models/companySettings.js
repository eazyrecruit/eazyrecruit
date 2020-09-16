var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySetting = new Schema({
        groupName: {type: String},
        key: {type: String},
        value: {type: String},
        companyId: {type: String}
})

module.exports = mongoose.model('companysettings', companySetting);