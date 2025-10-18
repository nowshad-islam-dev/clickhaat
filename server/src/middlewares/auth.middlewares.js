const jwt = require('jsonwebtoken');

exports.requireSignin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization required.' });
  }

  try {
    const { id, role } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id, role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  return res
    .status(403)
    .json({ error: 'Access denied. Admin privileges required.' });
};

exports.isUser = (req, res, next) => {
  if (req.user?.role === 'user') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Not a valid user.' });
};
