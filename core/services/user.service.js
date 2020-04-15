var mail = require('./email.service');
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var Role = require('../models/userRole');

exports.getRoles = async () => {
    return await Role.find({ is_deleted: false });
};

exports.getUsers = async (req, next) => {
    return await User.find({ is_deleted: false }).populate('roles');
};