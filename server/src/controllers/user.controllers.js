const jwt = require('jsonwebtoken');
const { generateUsername } = require('../utils/generateUsername');
const User = require('../models/user.models');

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const newUsername = await generateUsername(firstName, lastName);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      username: newUsername,
    });

    const savedUser = await newUser.save();
    if (!savedUser)
      return res.status(500).json({ message: 'Could not save user.' });

    return res.json({ message: 'User creted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email.' });
    }

    if (user.authenticate(password)) {
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
        }
      );
      const { firstName, lastName, fullName, email } = user;
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          role: user.role,
          firstName,
          lastName,
          fullName,
          email,
        },
      });
    } else {
      return res.status(401).json({ message: 'Invalid Password.' });
    }
  } catch (err) {
    console.log('Error:', err);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
};
