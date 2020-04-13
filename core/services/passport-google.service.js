var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var passport = require("passport");
var config = require('../config').config();
const User = require('../models/user');
var companyService = require('../services/company.service');


exports.setup = async function () {
    let googleConfig = await getGoogleConfig('google');
    passport.use(new GoogleStrategy({
        clientID: googleConfig.clientId,
        clientSecret: googleConfig.clientSecret,
        callbackURL: config.website + config.googleAuth.callbackURL,
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, token, refreshToken, profile, done) {
            process.nextTick(function () {
                try {
                    User.findOne({ email: profile.emails[0].value }).then(user => {
                        if (!user) {
                            return done(null, false, { msg: 'Invalid credential' });
                        } else {
                            return done(null, {id: user._id, displayName: user.name, email: user.email, roles: user.roles });
                        }
                    }).catch(err => {
                        return done(null, false, { msg: err });
                    });

                } catch (error) {
                    return done(error, null);
                }
            });
        }));
};

exports.authenticate = function (req, res, next) {
    passport.authenticate('google', function (err, user, info) {
        if (err) {
            next(err, null);
        }
        else if (!user) {
            next(info, null);
        }
        else {
            next(null, user);
        }
    })(req, next);
};


//this function will move into compnay settings
let getGoogleConfig = async (group) => {
    let company = [];
    let settings = [];
    company = await companyService.getCompany({});
    let req = {
        query: { id: company[0].id, group }
    }
    settings = await companyService.getSettings(req);
    let emailConfig = {};
    for (let i =0; i < settings.length; i++) {        
        Object.defineProperty(emailConfig, settings[i].key, {
            value: settings[i].value,
            writable: true
        });
    }
    return emailConfig;
}