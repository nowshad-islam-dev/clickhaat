const crypto = require('node:crypto');
const User = require('../models/user.models');

// Generate a unique username
exports.generateUsername = async function (firstName, lastName) {
  let base = `${firstName}_${lastName}`.toLowerCase();

  let username = base;
  let counter = 0;

  while (await User.exists({ username })) {
    if (counter < 5) {
      username = `${base}_${counter}`;
    } else {
      const shortHash = crypto.randomBytes(2).toString('hex');
      username = `${base}_${shortHash}`;
    }
    counter++;
  }
  return username;
};
