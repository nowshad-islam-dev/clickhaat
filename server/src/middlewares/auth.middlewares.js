const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

exports.requireSignin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new AppError('Authorization required.', 401);
  }

  try {
    const { id, role } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id, role };
    return next();
  } catch (err) {
    throw new AppError('Authorization required.', 401);
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  throw new AppError('Access denied. Admin privileges required.', 403);
};

exports.isUser = (req, res, next) => {
  if (req.user?.role === 'user') {
    return next();
  }
  throw new AppError('Access denied. Not a valid user.', 403);
};
