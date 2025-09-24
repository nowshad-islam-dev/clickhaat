const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid Email`,
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    contact: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number'],
    },
    profilePicture: { type: String, default: '' },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
);

userSchema.virtual('fullName').get(function () {
  return this.firstName + this.lastName;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret) {
    delete ret.password;
    return ret;
  },
});

userSchema.methods = {
  authenticate: function (candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
  },
};

module.exports = mongoose.model('User', userSchema);
