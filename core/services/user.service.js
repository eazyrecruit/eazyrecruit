var models = require('../sequelize');
var mail = require('./email.service');
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcrypt-nodejs');
var emailBody = require('../helpers/emailBody');
exports.register = (req, next) => {
    models.User.findOne({
        where: { email: req.body.createdEmail ? req.body.createdEmail : req.body.email }
    }).then(user => {
        if (!user && req.body.email) {
            models.User.create({
                email: req.body.createdEmail ? req.body.createdEmail : req.body.email,
                otp: uuidv4(),
                role_id: req.body.roleId
            }).then(data => {
                saveUserDetails(req, data, next);
            }).catch(err=>{
                next(err, null)
            });
        } else { 
            // next({ error: 'user already exist!' }, null) 
            next(null, user);
        }
    }).catch(err=>{
        next(err, null)
    });
};

exports.bulkRegister = (userArray, next) => {
    let emails = userArray.map(x => x.email);
    models.User.findAll({
        where: { email: emails }
    }).then(user => {
        let userList = [];
        if (user.length > 0) {
            userArray.forEach(element => {
                userObj =  user.find(x => x.email === element.email);
                if (!userObj) {
                    userList.push({
                        email: element.email,
                        otp: uuidv4(),
                        role_id: element.role
                    });
                }
            });
        } else {
            userList = userArray.map(x => {
                return {
                    email: x.email,
                    otp: uuidv4(),
                    role_id: x.roleId
                }
            });
        }

        if (userList.length > 0) {
            models.User.bulkCreate(userList).then(data => {
                let detailObj = {
                    newUser: data,
                    oldUser: user
                }
                bulkSaveUserDetails(detailObj, next);
            }).catch(err=>{
                next(err, null)
            });
        } else {
            next(null, user);
        }
    }).catch(err=>{
        next(err, null)
    });
};

function bulkSaveUserDetails (userDataObj, next) {
    let userDetails = userDataObj.newUser.map(obj => {
        return {
            user_id: obj.id,
            first_name: obj.email,
            last_name: '',
            phone: '',
            status: 1,
            created_by: 1,
            modified_by: 1
        }
    });
    models.UserDetail.bulkCreate(userDetails).then(user => {
        let userArray = [];
        userArray = user;
        if (userDataObj.oldUser.length > 0) {
            userDataObj.oldUser.forEach(element => {
                userArray.push(element);
            });
        }
        next(null, userArray)
    }).catch(err=>{
        next(err, null)
    });
}

exports.getRole = (req, next) => {
    models.Roles.findAll({ where: { is_deleted: false } }).then(role => {
        next(null, role);
    }).catch(err=>{
        next(err, null);
    });
};

exports.getUsers = (req, next) => {
    const Op = Sequelize.Op;
    let pageSize = req.body.pageSize != null ? req.body.pageSize : null;
    models.UserDetail.findAndCountAll({ 
        where: {
            [Op.or] : [
                { first_name: { [Op.like]: `%${req.body.searchText}%` } },
                { last_name: { [Op.like]: `%${req.body.searchText}%` } }
            ], 
            is_deleted: false
        },
        include: [{ model: models.User, attributes: ['email', 'role_id'] }],
        offset: req.body.offset, limit: parseInt(pageSize) 
     }).then(user => {
        next(null, user);
    }).catch(err=>{
        next(err, null)
    });
};

exports.searchUser = (req, next) => {
    const Op = Sequelize.Op;
    models.UserDetail.findAll({ 
        where: {
            [Op.or] : [
                { first_name: { [Op.like]: `%${req.params.value}%` } },
                { last_name: { [Op.like]: `%${req.params.value}%` } }
            ], 
            is_deleted: false 
        } 
    }).then(user => {
        next(null, user);
    }).catch(err=>{
        next(err, null)
    });
};

exports.getUserByOtp = (req, next) => {
    models.User.findOne({
        where: { otp: req.params.otp, is_deleted: false }
    }).then(user => {
        next(null, user);
    }).catch(err => {
        next(err, null);
    });
}

exports.changePassword = (req, next) => {
    models.User.findOne({
        where: { otp: req.body.otp, is_deleted: false }
    }).then(user => {
        if(user) {
            let hash = bcrypt.hashSync(req.body.newPassword);
            user.updateAttributes({
                password: hash,
                otp: null,
                status: 1
            })
            next(null, user);
        } else {
            next(null, 'Otp Expired!');
        }   
    }).catch(err => {
        next(err, null);
    });
}

function saveUserDetails (req, data, next) {
    models.UserDetail.create({
        user_id: data.id,
        first_name: req.body.createdEmail ? req.body.createdEmail : req.body.firstName,
        last_name: req.body.lastName ? req.body.lastName : '',
        phone: req.body.phoneNo ? req.body.phoneNo : '',
        status: 1,
        created_by: req.user != null ? req.user.id : 0,
        modified_by: req.user != null ? req.user.id : 0,
        role_id: req.body.roleId
    }).then(user => {
        if (!req.body.createdEmail) {
            var email = {};
            email.name = data.first_name ? `${data.first_name} ${data.last_name}` : req.body.createrEmail;
            email.receiverAddress = data.email;
            email.subject = 'Registration Successful!';
            email.body = emailBody.getEmailContent(email.subject, `${req.headers.origin}/resetpassword/${data.otp}`);
            mail.sendEmail(email, next);
        }
        next(null, user)
    }).catch(err=>{
        next(err, null)
    });
}

exports.getUserById = (req, next) => {
    models.User.findOne({
        where: { id: req.params.id, is_deleted: false },
        include: [{ model: models.UserDetail}]
    }).then(user => {
        next(null, user);
    }).catch(err => {
        next(err, null);
    });
}

exports.update = (req, next) => {
    models.UserDetail.findOne({
        where: { user_id: req.body.id, is_deleted: false }
    }).then(user => {
        user.update({
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            phone: req.body.phoneNo,
            status: 1,
            created_by: req.user != null ? req.user.id : 0,
            modified_by: req.user != null ? req.user.id : 0,
            role_id: req.body.roleId
        }).then(data => {
            next(null, data);
        }).catch(err=>{
            next(err, null);
        });
    }).catch(err=>{
        next(err, null)
    });
};

exports.delete = (req, next) => {
    models.User.findOne({
        where: { id: req.params.id, is_deleted: false }
    }).then(user => {
        user.update({
            is_deleted: true
        }).then(data => {
            models.UserDetail.findOne({
                where: { user_id: req.params.id, is_deleted: false }
            }).then(userDetail => {
                userDetail.update({
                    is_deleted: true
                }).then(updateUserDetail => {
                    next(null, updateUserDetail);
                }).catch(updateError => {
                    next(updateError, null);
                });
            }).catch(error => {
                next(error, null);
            });
        }).catch(err=>{
            next(err, null);
        });
    }).catch(err=>{
        next(err, null)
    });
};

exports.getUserByEmail = (userEmails, next) => {
    models.User.findAll({
        where: { is_deleted: false, email: userEmails },
        include: [{ model: models.UserDetail}]
    }).then(user => {
        next(null, user);
    }).catch(err => {
        next(err, null);
    });
}

exports.saveUserDetails = saveUserDetails;