var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var passport = require("passport");
var config = require('../config').config();
const User = require('../models/user');
var companyService = require('../services/company.service');
let googleConfig = {};

exports.setup = async function () {
    googleConfig = await getGoogleConfig('google');
    if (googleConfig && googleConfig.clientId) {
        passport.use(new GoogleStrategy({
                clientID: googleConfig ? googleConfig.clientId : null,
                clientSecret: googleConfig ? googleConfig.clientSecret : null,
                callbackURL: config.website + config.googleAuth.callbackURL,
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, token, refreshToken, profile, done) {
                process.nextTick(function () {
                    try {
                        User.findOne({email: profile.emails[0].value}).populate('roles').exec((err, user) => {
                            if (err) {
                                return done(err);
                            }
                            if (!user) {
                                return done(null, false, {status: 401, message: 'invalid user'});
                            } else {
                                let isPicture = false;
                                if (user.picture) {
                                    isPicture = true;
                                }
                                let roles = [];
                                if (user.roles && user.roles.length) {
                                    for (let i = 0; i < user.roles.length; i++) {
                                        roles.push(user.roles[i].name);
                                    }
                                    let name = `${user.firstName ? user.firstName : user.email} ${user.lastName ? user.lastName : ''}`;
                                    return done(null, {
                                        id: user._id,
                                        displayName: name,
                                        email: user.email,
                                        roles,
                                        isPicture
                                    });
                                } else {
                                    return done(null, false, {status: 401, message: 'insufficient privileges'});
                                }
                            }
                        });
                    } catch (error) {
                        return done(error, null);
                    }
                });
            }));
    }
};

exports.authenticate = async function (req, res, next) {
    googleConfig = await getGoogleConfig('google');
    if (googleConfig && googleConfig.clientId && googleConfig.clientSecret) {
        passport.authenticate('google', function (err, user, info) {
            if (err) {
                next(err, null);
            } else if (!user) {
                next(info, null);
            } else {
                next(null, user);
            }
        })(req, next);
    } else {
        console.error('Error : client id and secret not found.');
        next({message: 'client id and secret not found', status: 401}, null);
    }
};


//this function will move into compnay settings
let getGoogleConfig = async (group) => {
    let company = [];
    let settings = [];
    let emailConfig = {};
    company = await companyService.getCompany();
    if (company && company.length) {
        let req = {id: company[0].id, group};
        settings = await companyService.getSettings(req);
        for (let i = 0; i < settings.length; i++) {
            Object.defineProperty(emailConfig, settings[i].key, {
                value: settings[i].value,
                writable: true
            });
        }
    }
    return emailConfig;
}
