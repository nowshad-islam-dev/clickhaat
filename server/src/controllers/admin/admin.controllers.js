const jwt = require('jsonwebtoken');
const { generateUsername } = require('../../utils/generateUsername');
const User = require('../../models/user.models');
const AppError = require('../../utils/AppError');

exports.signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.exists({ email });
  if (existingUser) {
    throw new AppError('User already exists.', 400);
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

  return res
    .status(201)
    .json({ status: 'success', message: 'Admin created successfully.' });
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
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
      status: 'success',
      message: 'login successfull.',
      data: {
        token,
        user: {
          id,
          role,
          firstName,
          lastName,
          fullName,
          email,
        },
      },
    });
  } else {
    throw new AppError('Invalid email or password.', 401);
  }
};
