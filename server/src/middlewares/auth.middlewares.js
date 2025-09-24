exports.requireSignin = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const { id, role } = jwt.verify(token, process.env.JWT_SECRET);
  const user = { id, role };
  req.user = user;
  next();
};
