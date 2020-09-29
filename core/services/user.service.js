var mail = require('./email.service');
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var Role = require('../models/userRole');
var emailService = require('../services/email.service');
var bcryptNodejs = require("bcrypt-nodejs");
var config = require('../config').config();
const fs = require("fs");
var Readable = require('stream').Readable;
let path = require("path");
exports.getRoles = async () => {
    return await Role.find({is_deleted: false});
};

exports.getUsers = async (req) => {
    let skip = 0, limit = 10;
    let count = 0;
    let users;
    if (req.query.all == 'true') {
        users = await User.find({is_deleted: false}, {password: 0, passwordResetToken: 0});
    } else {
        if (req.query.limit) limit = parseInt(req.query.limit);
        if (req.query.offset) skip = parseInt(req.query.offset);
        count = await User.count({"email": {"$regex": req.query.search, "$options": "i"}, is_deleted: false});
        users = await User.find({
            "email": {"$regex": req.query.search, "$options": "i"},
            is_deleted: false
        }, {password: 0, passwordResetToken: 0}).populate('roles').skip(skip).limit(limit).exec();
    }
    return {count, users};
};

exports.getUser = async (ownerId) => {
    return await User.findOne({_id: ownerId, is_deleted: false}, {passwordResetToken: 0});
};
exports.register = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.find({email: req.body.email, is_deleted: false});
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
                    email.toEmail = userModel.email;
                    email.subject = 'Registration successfull';
                    email.title = 'Registration successfull';
                    email.body = `Please use below link to reset your password.<br/><a href="${req.headers.origin}/admin/resetpassword/${otp}">Reset Password</a>`;
                    try {
                        await emailService.sendEmail(email, () => {
                        });
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
            console.log('create user catch: ', error);
            reject(error);
        }
    });
};
exports.update = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userModel = await User.findById({_id: req.params.id, is_deleted: false});
            if (userModel) {
                try {
                    // update user
                    userModel.name = `${req.body.firstName} ${req.body.lastName}`;
                    userModel.firstName = req.body.firstName;
                    userModel.lastName = req.body.lastName;
                    userModel.roles = req.body.roleId,
                        userModel.phone = [req.body.phone],
                        userModel.modified_by = req.user.id,
                        userModel.modified_at = new Date();
                    resolve(await userModel.save());
                } catch (error) {
                    let err = {
                        status: 500,
                        message: 'internal server error'
                    }
                    console.log('update user : ', error);
                    reject(err);
                }
            } else {
                let err = {
                    status: 404,
                    message: 'user not found'
                }
                console.log('update user : ', err);
                reject(err);
            }
        } catch (error) {
            console.log('update user catch: ', error);
            reject(error);
        }
    });
};

/**
 * we are sending file data in stream
 * @param ownerId
 * @param res
 */
exports.fileStream = async (ownerId, res) => {
    try {
        let userModel = await User.findById({_id: ownerId, is_deleted: false});
        if (userModel && userModel.picture) {
            const imgBuffer = Buffer.from(userModel.picture, 'base64');
            res.writeHead(200, {
                'Cache-Control': 'max-age=3600, private',
                'Content-Length': imgBuffer.length,
                'Content-Type': 'image/png'
            });
            return res.end(imgBuffer);
        } else {
            return res.sendStatus(404);
        }

    } catch (error) {
        console.log("accountService-->fileStream-->", error);
        return res.sendStatus(404);
    }
};

exports.updateUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userModel = await User.findById({_id: data.ownerId, is_deleted: false});
            if (userModel) {
                try {
                    if (data.newPassword) {
                        if (!data.oldPassword) {
                            let err = {
                                status: 200,
                                message: 'old password is incorrect'
                            };
                            console.log('update user : ', err);
                            return reject(err);
                        }
                        userModel.comparePassword(data.oldPassword, async (isMatch) => {
                            if (isMatch) {
                                userModel.password = data.newPassword;
                                return resolve(await userModel.save());
                            } else {
                                let err = {
                                    status: 200,
                                    message: 'old password is incorrect'
                                };
                                console.log('update user : ', err);
                                return reject(err);
                            }
                        });
                    } else {
                        if (data.isRemovePhoto === true || data.isRemovePhoto === "true") {
                            userModel["picture"] = null;
                        }
                        if (data.files && data.files.length) {
                            userModel["picture"] = data.files[0].buffer.toString('base64');
                        }

                        // update user
                        userModel.name = `${data.firstName} ${data.lastName}`;
                        userModel.firstName = data.firstName || userModel.firstName;
                        userModel.lastName = data.lastName || userModel.lastName;
                        userModel.phone = [data.phoneNo];
                        userModel.modified_by = data.ownerId;
                        userModel.modified_at = new Date();
                        resolve(await userModel.save());
                    }

                } catch (error) {
                    let err = {
                        status: 500,
                        message: 'internal server error'
                    }
                    console.log('update user : ', error);
                    reject(err);
                }
            } else {
                let err = {
                    status: 404,
                    message: 'user not found'
                }
                console.log('update user : ', err);
                reject(err);
            }
        } catch (error) {
            console.log('update user catch: ', error);
            reject(error);
        }
    });
};

async function updateUserProfilePicture(files, key) {
    return new Promise(async (resolve, reject) => {
        try {
            if (files && files.length) {
                let file = files[0];
                if (config.profileSupportFileType.indexOf(file.mimetype) < 0) {
                    return reject({message: "This file type not supported", status: 400})
                }
                if (config.profileSupportFileSize < file.size) {
                    return reject({message: "file size limit exceed", status: 400})
                }
                let fileFullPath = await getTempFilePath(file);
                resolve(await base64_encode(fileFullPath));
            } else {
                return reject({message: "internal server error", status: 500})
            }
        } catch (error) {
            console.log("accountService-->updateUserProfilePicture-->", error);
            return reject({message: "internal server error", status: 500})
        }
    });
}

/**
 * keep the file in temp storage and get temp file path
 * @param file
 * @returns
 */
async function getTempFilePath(file) {
    return new Promise(async (resolve, reject) => {
        let fileName = file.name.split(" ").join("");
        let tempFilePath = "profile/" + Date.now() + '_' + fileName;
        let fileFullPath = path.join(config.rootPath, tempFilePath);
        file.mv(fileFullPath, async (err, data) => {
            if (err) {
                console.log("getFileData->", err);
                reject(err);
            } else {
                resolve(fileFullPath)
            }
        });
    });
}

/**
 * convert img into base 64
 * @param fileName
 * @returns {Promise<unknown>}
 */
async function base64_encode(fileName) {
    return new Promise(async (resolve, reject) => {
        try {
            let bitmap = fs.readFileSync(fileName);
            let data = new Buffer(bitmap).toString('base64');
            fs.unlink(fileName, (_err) => {
                if (_err) {
                    console.log("unlink-->", _err);
                }
            });

            resolve(data);
            // convert binary data to base64 encoded string
        } catch (error) {
            console.log("catch-->base64_encode", error);
            resolve(null)
        }
    });
}

exports.delete = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userModel = await User.findById({_id: req.params.id, is_deleted: false});
            if (userModel) {
                try {
                    // delete user
                    userModel.is_deleted = true,
                        userModel.modified_by = req.user.id,
                        userModel.modified_at = new Date();
                    resolve(await userModel.save());
                } catch (error) {
                    let err = {
                        status: 500,
                        message: 'internal server error'
                    }
                    console.log('delete user : ', error);
                    reject(err);
                }
            } else {
                let err = {
                    status: 404,
                    message: 'user not found'
                }
                console.log('delete user : ', err);
                reject(err);
            }
        } catch (error) {
            console.log('delete user catch: ', error);
            reject(error);
        }
    });
};
