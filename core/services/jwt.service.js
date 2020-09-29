/* jshint node: true */
'use strict';

var jwt = require('jsonwebtoken');

var configuration = require('../config').config();
const expressJwt = require('express-jwt');

//constructor of Authentication file to pre initialize data for authenticate
function jwtProfile() {
//common functionality
}

jwtProfile.prototype = {
  //configure application level data which will be used in authentication
  configure: function (options) {
    configuration = options;
  },

  verify: function (options) {
    function secretCallBack(req, payload, done) {
      if (payload) {
        payload.secret = configuration.jwt.secret;
        options.secret(req, payload, done);
      }
      else {
        done(null, new Error('unrecognized or missing secret'));
      }
    }

    return expressJwt({secret: secretCallBack});
  },

  generateToken: function (user) {
    return jwt.sign(user, configuration.jwt.secret, {
      audience: configuration.jwt.audience,
      issuer: configuration.jwt.issuer,
      expiresIn: configuration.jwt.expireTime
    });
  }
};

var jwtConfig = new jwtProfile();

/**
 * Expose `Authentication`.
 */
//module.exports = Authentication;
exports.jwtProfile = jwtConfig;

