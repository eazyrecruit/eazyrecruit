var LocalStrategy = require('passport-local').Strategy;
var passport = require("passport");
const User = require('../models/user');

exports.setup = function () {
  passport.use(new LocalStrategy({
    usernameField: 'userName',    // define the parameter in req.body that passport can use as username and password
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    function (req, username, password, done) {
      try {
        User.findOne({ email: username.toLowerCase() }).populate('roles').exec((err, user) => {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { status: 401, message: 'Invalid email or password.' });
          }
          if (!user.password) {
            return done(null, false, { msg: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.' });
          }
          user.comparePassword(password, (isMatch) => {
            if (isMatch) {
              let roles = [];
              if (user.roles && user.roles.length) {
                  for (let i = 0; i < user.roles.length; i++) {
                      roles.push(user.roles[i].name);
                  }
                  return done(null, {id: user._id, displayName: user.name, email: user.email, roles });
              } else {
                return done(null, false, { status: 401, message: 'insufficient privileges' });
              }
            }
            return done(null, false, { status: 401, message: 'Invalid email or password.' });
          });
        });
      } catch (error) {
        return done(null, false, { msg: error });
      }
    }
  ));

  passport.serializeUser(function (user, done) {
    if (user) {
      done(null, user); // nothing is required
    }
  });

  passport.deserializeUser(function (user, done) {
    return done(null, user); // nothing is required
  });
};

exports.authenticate = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
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
