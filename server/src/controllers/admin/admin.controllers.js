const jwt = require('jsonwebtoken');
const { generateUsername } = require('../../utils/generateUsername');
const User = require('../../models/user.models');

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Admin already exists.' });
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

    const savedUser = await newUser.save();
    if (!savedUser)
      return res.status(500).json({ message: 'Could not save admin.' });

    return res.json({ message: 'Admin created successfully.' });
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
      return res.status(401).json({ message: 'Invalid Password.' });
    }
  } catch (err) {
    console.log('Error:', err);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
};

exports.requireSignin = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const { id, role } = jwt.verify(token, process.env.JWT_SECRET);
  const user = { id, role };
  req.user = user;
  next();
};
