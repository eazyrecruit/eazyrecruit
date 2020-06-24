var config = require('../config').config();
var bcryptNodejs = require("bcrypt-nodejs");
var emailService = require('./email.service');
const uuidv4 = require('uuid/v4');
const User = require('../models/user');

exports.register = (req, next) => {
    let hash = bcryptNodejs.hashSync(req.body.password);
    User.find({email: req.body.email }).then(user => {
        if (user.length === 0 && req.body.email) {
            var user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hash,
                role_id: req.body.role_id
            }).then(data => next(null, data));
        } else {  next('user already exist!', null) }
    }).catch(err=>{
        next(err, null)
    });
};

exports.getUser = (req, next) => {
    User.find({is_deleted: false}).then(user => {
        next(null, user);
    }).catch(err=>{
        next(err, null)
    });
};

exports.resetPassword = (req, next) => {
    User.findOne({ email: req.body.email, is_deleted: false }).then(async (user) => {
        if (user) {
            if (user.google != true) {
                try {
                    var email = {};
                    let otp = uuidv4();
                    user.passwordResetToken = otp;
                    await user.save();
                    email.name = user.firstName ? `${user.firstName} ${user.lastName}` : req.body.email;
                    email.receiverAddress = user.email;
                    email.subject = 'Reset Password';
                    email.body = `Please use below link to reset your password.<br/><a href="${req.headers.origin}/admin/resetpassword/${otp}">Reset Password</a>`;
                    emailService.sendEmail(email, (err, data) => {
                        if (err) {
                            let err = {
                                status: 500,
                                message: 'internal server error'
                            }
                            console.log('forget password : ', error);
                            next(err, null);
                        } else {
                            next(null, `An email has been sent to ${email.receiverAddress} for reset your password.`);
                        }
                    });
                } catch (error) {
                    let err = {
                        status: 500,
                        message: 'internal server error'
                    }
                    console.log('forget password : ', error);
                    next(err, null);
                }
            } else {
                let err = {
                    status: 400,
                    message: 'Google login found, password can not be reset'
                }
                next(err, null);
            }            
        } else {
            let err = {
                status: 400,
                message: 'User does not exist'
            }
            next(err, null);
        }
    }).catch(err => {
        next(err, null);
    });
};

exports.getUserByOtp = (req, next) => {
    User.findOne({ passwordResetToken: req.params.otp, is_deleted: false }).then(user => {
        next(null, user);
    }).catch(err => {
        next(err, null);
    });
}

exports.changePassword = async (req, next) => {
    try {
        User.findOneAndUpdate({ passwordResetToken: req.body.otp, is_deleted: false }, 
            { $set: { password: bcryptNodejs.hashSync(req.body.newPassword), passwordResetToken: null } }, {new: true}, (err, doc) => {
            if (err) {
                next(err, null);
            } else {
                next(null, doc);
            }
        });
    } catch (error) {
        next(null, error);
    }
}