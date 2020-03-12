var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySettings = new Schema({
        groupName: {type: String},
        key: {type: String},
        value: {type: String},
        companyId: {type: String}
})

var companiessetting = mongoose.model('companiessettings', companySettings);
module.exports = companiessetting;