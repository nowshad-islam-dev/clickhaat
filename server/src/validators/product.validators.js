const { body } = require('express-validator');

exports.validateProductCreationRequest = [
  body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Product name is required.')
    .isLength({ max: 500 })
    .withMessage('Product name must be less than 500 characters.'),

  body('price').trim().escape(),

  body('description')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Product description is required.')
    .isLength({ max: 3000 })
    .withMessage('Product descriptionn must be less than 3000 characters.'),

  body('quantity')
    .optional()
    .trim()
    .escape()
    .isNumeric()
    .withMessage('Quantity must be a valid number.'),

  body('offer')
    .optional()
    .trim()
    .escape()
    .isNumeric()
    .withMessage('Offer must be a valid number.'),

  body('category').notEmpty().withMessage('Category must be provided.'),
];
