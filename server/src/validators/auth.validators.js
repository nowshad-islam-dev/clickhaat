const { body, validationResult } = require('express-validator');

exports.validateSignupRequest = [
  body('firstName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('First Name is required.')
    .isLength({ max: 20 })
    .withMessage('First Name must be less than 20 characters.'),

  body('lastName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Last Name is required.')
    .isLength({ max: 20 })
    .withMessage('Last Name must be less than 20 characters.'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
];

exports.validateSiginRequest = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
];

exports.isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};
