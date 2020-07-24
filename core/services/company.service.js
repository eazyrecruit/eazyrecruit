let Company = require('../models/company');
let CompanySettings = require('../models/companySettings');
let encryptService = require('../services/encryption.service');
let google = require('../services/passport-google.service');
let fs = require('fs')
let utilService = require('../services/util.service');

exports.getCompany = async () => {
    return await Company.find({});
};

exports.getSettings = async (req) => {
    try {
        let companySettings = await CompanySettings.find({companyId: req.query.id} && {groupName: req.query.group});
        if (companySettings && companySettings.length) {
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
    var dbCompanySettings = await CompanySettings.find({companyId: req.query.id, groupName: req.query.group});
    if (dbCompanySettings.length <= 0) {
        for (index = 0; index < formKeys.length; index++) {
            let companySetting = await CompanySettings.create({
                companyId: req.query.id,
                groupName: req.query.group,
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
            let companySettings = await CompanySettings.findOneAndUpdate({
                    companyId: req.query.id,
                    groupName: req.query.group,
                    key: formKeys[index]
                },
                {value: encryptService.encrypt(formValues[index].toString())}, {new: true});
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

exports.update = async (req, next) => {
    try {
        let image;
        let companyRequest = {};
        if (req.files.length) {
            let fileData = {};
            for (let index = 0; index < req.files.length; index++) {
                fileData[req.files[index].fieldname] = req.files[index];
            }
            if (fileData.hasOwnProperty("logo")) {
                companyRequest["logo"] = await utilService.readWriteFile(fileData["logo"], req.body.id + "_logo_" + new Date().getMilliseconds());
            }
            if (fileData.hasOwnProperty("favIcon")) {
                companyRequest["favIcon"] = await utilService.readWriteFile(fileData["favIcon"], req.body.id + "_favIcon_" + new Date().getMilliseconds());
            }

        }
        companyRequest["name"] = req.body.name;
        companyRequest["website"] = req.body.website;
        companyRequest["address_line_1"] = req.body.address_line_1;
        companyRequest["address_line_2"] = req.body.address_line_2;
        companyRequest["address_line_3"] = req.body.address_line_3;
        companyRequest["email"] = req.body.email;
        companyRequest["phone"] = req.body.phone;
        companyRequest["header_description"] = req.body.headerDescription;
        companyRequest["header_bg_color"] = req.body.headerBgColor;
        companyRequest["header_text_color"] = req.body.headerTextColor;
        companyRequest["modified_at"] = Date.now();
        Company.findByIdAndUpdate(req.body.id, companyRequest,
            function (err, data) {
                if (err) {
                    next(err, null);
                } else {
                    next(null, data);
                }
            });
    } catch (error) {
        next(error, null);
    }
}

exports.save = async (req, next) => {

    if (req.body.hasOwnProperty("group")) {
        var groupNames = [];
        let groups = req.body.group;
        groupNames = Object.keys(groups);
        let logoName = "";
        if (req.files && req.files.length) {
            logoName = await utilService.readWriteFile(req.files[0], req.body.name);
        }

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
                logo: logoName,
                header_description: req.body.headerDescription,
                created_by: req.body.created_by,
                created_at: Date.now(),
                modified_by: req.body.modified_by,
                modified_at: Date.now(),
                groupName: groupNames
            }
        );
        company.save(function (err, result) {
            if (err) {
                next(err, null);
            } else {
                var companySetting = [];
                for (var key in groups) {
                    groups[key].forEach(group => {
                        companySetting.push({
                            groupName: key,
                            key: group.key,
                            value: group.value,
                            companyId: result._id.toString()
                        })
                    });
                }
                CompanySettings.collection.insertMany(companySetting, (error, data) => {
                    next(null, (result, data))
                })
            }
        })
    }
};

exports.delete = function (req, next) {
    Company.findByIdAndUpdate(req.query.id,
        {
            is_deleted: true,
            modified_at: Date.now()
        },
        function (err, data) {
            if (err) {
                next(err, null);
            } else {
                next(null, data);
            }
        });
}
