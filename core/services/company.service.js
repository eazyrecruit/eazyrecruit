let Company = require('../models/company');
let CompanySettings = require('../models/companySettings');
let encryptService = require('../services/encryption.service');

exports.getCompany = function(req, next){
    Company.find({}, (error, company) => {
        if(error) {
            next(error, null);
        } else {
            next(null, company);
        }
    })
};

exports.getSettings = function(req, next){
    CompanySettings.find({companyId : req.query.id} && {groupName : req.query.group}, (error, data) => {
        if(error) {
            next(error, null);
        } else {
            if (data && data.length) {
                for (let i = 0; i < data.length; i++) {
                    console.log(data[i]);
                }                
            }
            next(null, data);
        }
    })
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
            CompanySettings.create({
                companyId : req.query.id, 
                groupName : req.query.group, 
                key: formKeys[index],
                value: encryptService.encrypt(formValues[index])
                }, 
                function (err, result) {
                    if (err) {
                        next(err, null);
                    } else {
                        data.push(result);
                        index--;
                        if (data && index == 0) {
                            next(null, data)
                        }
                    }
            });
        }
    } else {
        for (index = 0; index < formKeys.length; index++) {
            CompanySettings.findOneAndUpdate({companyId : req.query.id, groupName : req.query.group, key: formKeys[index]}, 
                {
                    value: formValues[index]
                }, 
                function (err, result) {
                    if (err) {
                        next(err, null);
                    } else {
                        data.push(result);
                        index--;
                        if (data && index == 0) {
                            next(null, data)
                        }
                    }
            });
        }
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
