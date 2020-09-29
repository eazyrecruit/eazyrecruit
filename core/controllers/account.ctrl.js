var passport = require("passport");
var passportLocal = require("../services/passport-local.service");
var passportGoogle = require("../services/passport-google.service");

var express = require('express');
var router = express.Router();
var jwt = require("../services/jwt.service").jwtProfile;
var responseService = require('../services/response.service');
var accountService = require("../services/account.service");
var validationService = require('../services/validation.service');

// router.post("/login", validationService.validateLoginDetail, function (req, res) {
router.post("/login", function (req, res) {
    passportLocal.authenticate(req, res, function (err, data) {
        if (err) {
            responseService.errorResponse(err, 'Login', res);
        } else {

            data.token = jwt.generateToken({
                id: data.id,
                displayName: data.displayName,
                email: data.email,
                roles: data.roles
            });
            responseService.successResponse(data, 'Login', res);
        }
    });
});

router.post("/register", function (req, res) {
    accountService.register(req, function (err, users) {
        responseService.response(req, err, 'Register', true, res);
    })
});

router.post("/forget", (req, res) => {
    accountService.resetPassword(req, (err, user) => {
        if (err) {
            responseService.errorResponse(err, 'Forget Password', res);
        } else {
            responseService.successResponse(user, 'Forget Password', res);
        }
    });
});

router.post("/resetpassword", (req, res) => {
    accountService.changePassword(req, (err, data) => {
        responseService.response(req, err, 'change password', data, res);
    });
});


router.post("/resetpassword", (req, res) => {
    accountService.changePassword(req, (err, data) => {
        responseService.response(req, err, 'change password', data, res);
    });
});

router.get("/verify/:otp", (req, res) => {
    accountService.getUserByOtp(req, (err, data) => {
        if (err) {
            responseService.response(req, err, 'otp validation', 'otp validation failed', res);
        } else {
            responseService.response(req, err, 'otp validation', data, res);
        }
    });
});

// Google routes
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}), (req, res) => {
});
router.get("/google/callback", function (req, res) {
    passportGoogle.authenticate(req, res, function (err, data) {
        if (err) {
            responseService.errorResponse(err, 'Login', res);
        } else {
            data.token = jwt.generateToken({
                id: data.id,
                displayName: data.displayName,
                email: data.email,
                roles: data.roles
            });
            responseService.successResponse(data, 'Login', res);
        }
    });
});
module.exports.account = router;
