const jwt = require('jsonwebtoken');
const { generateUsername } = require('../../utils/generateUsername');
const User = require('../../models/user.models');

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Admin already exists.' });
    }

    const newUsername = await generateUsername(firstName, lastName);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      username: newUsername,
      role: 'admin',
    });

    await newUser.save();

    return res.status(201).json({ message: 'Admin created successfully.' });
  } catch (err) {
    console.log('Error-->(admin):', err);
    return res.status(500).json({ error: 'Failed to sign up as admin.' });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.authenticate(password) && user.role === 'admin') {
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
        }
      );
      const { firstName, lastName, fullName, email, id, role } = user;
      return res.status(200).json({
        token,
        user: {
          id,
          role,
          firstName,
          lastName,
          fullName,
          email,
        },
      });
    } else {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
  } catch (err) {
    console.log('Error-->(admin):', err);
    return res.status(500).json({ error: 'Failed to sign in as admin.' });
  }
};
