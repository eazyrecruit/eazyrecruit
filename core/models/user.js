var bcrypt = require("bcrypt-nodejs");
const crypto = require('crypto');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'UserRoles'
  }],
  phone: String,
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: Boolean,
  google: String,
  tokens: Array,
  picture: String,
  is_deleted: Boolean,
  created_by: {
      type: Schema.Types.ObjectId,
      ref: 'Users'
  },
  created_at: Date,
  modified_by: {
      type: Schema.Types.ObjectId,
      ref: 'Users'
  },
  modified_at: Date
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  else {user.password = bcrypt.hashSync(user.password); return next();}
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  cb(bcrypt.compareSync(candidatePassword, this.password));
}

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

var Users;
if (mongoose.models.Users) {
  Users = mongoose.model('Users');
} else {
  Users = mongoose.model('Users', userSchema);
}
module.exports = Users;
