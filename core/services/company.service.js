let Company = require('../models/company');
let CompanySettings = require('../models/companySettings');
let encryptService = require('../services/encryption.service');
let google = require('../services/passport-google.service');
exports.getCompany = async (req) => {
    return await Company.find({});
};

exports.getSettings = async (req) => {
    try {
        let companySettings = await CompanySettings.find({companyId : req.query.id} && {groupName : req.query.group});
        if(companySettings && companySettings.length) {
            for (let i = 0; i < companySettings.length; i++) {
                companySettings[i].value = encryptService.decrypt(companySettings[i].value)
            }
        }
        return companySettings;
    } catch (error) {
        return error;
    }
};

exports.updateSettings = async (req, next) => {
    let settings = req.body;
    var index;
    var data = [];
    var formKeys = [];
    var formValues = [];
    formKeys = Object.keys(settings);
    formValues = Object.values(settings);
    var dbCompanySettings = await CompanySettings.find({companyId : req.query.id, groupName : req.query.group});
    if (dbCompanySettings.length <= 0) {
        for (index = 0; index < formKeys.length; index++) {
            let companySetting = await CompanySettings.create({
                companyId : req.query.id, 
                groupName : req.query.group, 
                key: formKeys[index],
                value: encryptService.encrypt(formValues[index].toString())
                });    
            if (companySetting) {
                companySetting.value = encryptService.decrypt(companySetting.value)
                data.push(companySetting);
            }
        }
        if (req.query.group === 'google') {
            google.setup();
        }
        return data;
    } else {
        for (index = 0; index < formKeys.length; index++) {
            let companySettings = await CompanySettings.findOneAndUpdate({companyId : req.query.id, groupName : req.query.group, key: formKeys[index]},
                { value: encryptService.encrypt(formValues[index].toString())});
            if (companySettings) {
                companySettings.value = encryptService.decrypt(companySettings.value)
                data.push(companySettings);
            }
        }
        if (req.query.group === 'google') {
            google.setup();
        }
        return data;
    }
}

exports.update = (req, next) => {
    Company.findByIdAndUpdate(req.body.id, 
        {
            name: req.body.name,
            website: req.body.website,
            address_line_1: req.body.address_line_1,
            address_line_2: req.body.address_line_2,
            address_line_3: req.body.address_line_3,
            email: req.body.email,
            phone: req.body.phone,
            is_deleted: false,
            modified_at:  Date.now()
        }, 
        function (err, data) {
            if (err) {
                next(err, null);
            } else { 
                next(null, data);
        }
    });
}

exports.save = function (req, next) {
    
    if(req.body.hasOwnProperty("group"))
    {
        var groupNames = [];
        let groups = req.body.group;
        groupNames = Object.keys(groups);
        var company = new Company(
        {
            name: req.body.name,
            website: req.body.website,
            address_line_1: req.body.address_line_1,
            address_line_2: req.body.address_line_2,
            address_line_3: req.body.address_line_3,
            email: req.body.email,
            phone: req.body.phone,
            is_deleted: false,
            created_by: req.body.created_by,
            created_at:  Date.now(),
            modified_by: req.body.modified_by,
            modified_at:  Date.now(),
            groupName: groupNames
        }
    );
    company.save(function (err, result) {
        if (err) {
            next(err, null);
        } else {
            var companySetting = [];
            for(var key in  groups){
                groups[key].forEach(group => {
                    companySetting.push({
                        groupName: key,
                        key: group.key,
                        value: group.value,
                        companyId: result._id.toString()
                    })
                });
            }
            CompanySettings.collection.insertMany(companySetting, (error, data)=>{
                next(null, (result,data))
            })
        }
    })}
};

exports.delete = function (req, next) {
    Company.findByIdAndUpdate(req.query.id , 
        {
            is_deleted: true,
            modified_at:  Date.now()
        }, 
        function (err, data) {
            if (err) {
                next(err, null);
            } else { 
                next(null, data);
        }
    });
}
