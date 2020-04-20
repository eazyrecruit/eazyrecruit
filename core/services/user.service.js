var mail = require('./email.service');
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var Role = require('../models/userRole');
var emailService = require('../services/email.service');

exports.getRoles = async () => {
    return await Role.find({ is_deleted: false });
};

exports.getUsers = async (req) => {
    let skip = 0, limit = 10;
    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.offset) skip = parseInt(req.query.offset);
    let count = await User.count({ "email": { "$regex": req.query.search, "$options": "i" }, is_deleted: false });
    let users = await User.find({ "email": { "$regex": req.query.search, "$options": "i" }, is_deleted: false }).populate('roles').skip(skip).limit(limit).exec();
    return { count, users };
};

exports.register = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.find({ email: req.body.email, is_deleted: false });
            if (user && user.length) {
                resolve(`${req.body.email} already exist`);
            } else {
                try {
                    //create user
                    let otp = uuidv4();
                    let userModel = new User();
                    userModel.name = `${req.body.firstName} ${req.body.lastName}`
                    userModel.email = req.body.email;
                    userModel.firstName = req.body.firstName;
                    userModel.lastName = req.body.lastName;
                    userModel.roles = req.body.roleId,
                    userModel.phone = [req.body.phone],
                    userModel.passwordResetToken = otp,
                    userModel.passwordResetExpires = new Date(),
                    userModel.emailVerificationToken = '',
                    userModel.emailVerified = false,
                    userModel.google = false,
                    userModel.tokens = [],
                    userModel.picture = '',
                    userModel.is_deleted = false,
                    userModel.created_by = req.user.id,
                    userModel.created_at = new Date(),
                    userModel.modified_by = req.user.id,
                    userModel.modified_at = new Date();
                    await userModel.save();
        
                    //send email
                    let email = {};
                    email.name = userModel.firstName ? `${userModel.firstName} ${userModel.lastName}` : req.body.email;
                    email.receiverAddress = userModel.email;
                    email.subject = 'Registration successfull';
                    email.body = `Please use below link to reset your password.<br/><a href="${req.headers.origin}/admin/resetpassword/${otp}">Reset Password</a>`;
                    try {
                        await emailService.sendEmail(email);
                        resolve(`An email has been sent to ${email.receiverAddress} for user registration.`);
                    } catch (error) {
                        let err = {
                            status: 500,
                            message: 'internal server error'
                        }
                        console.log('user registration email error : ', error);
                        reject(err); 
                    }
                } catch (error) {
                    let err = {
                        status: 500,
                        message: 'internal server error'
                    }
                    console.log('create user : ', error);
                    reject(err);
                }
            }   
        } catch (error) {
            reject(error);
        }        
    });
};