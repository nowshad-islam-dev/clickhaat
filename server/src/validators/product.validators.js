const { body } = require('express-validator');

exports.validateProductCreationRequest = [
  body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Product name is required.')
    .isLength({ min: 6, max: 500 })
    .withMessage('Product name must be between 6 and 500 characters.'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),

  body('description')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Product description is required.')
    .isLength({ min: 20, max: 3000 })
    .withMessage(
      'Product descriptionn must be between 20 and 3000 characters.'
    ),

  body('quantity')
    .optional()
    .escape()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a valid number.'),

  body('offer')
    .optional()
    .escape()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Offer must be between 0 and 100.'),

  body('picture').optional().isArray().withMessage('Picture must be an array'),

  body('picture.*url')
    .optional({ nullable: true })
    .isString()
    .withMessage('Picture URL must be a string')
    .isLength({ max: 2048 })
    .withMessage('Picture URL is too long'),

  body('picture.*.alt')
    .optional({ nullable: true })
    .trim()
    .escape()
    .isLength({ max: 20 })
    .withMessage('Alt text must be at most 20 characters'),

  body('picture.*.isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean'),

  body('review').optional().isArray().withMessage('Review must be an array'),

  body('review.*.user')
    .optional()
    .isMongoId()
    .withMessage('Review user must be a valid MongoDB ObjectId'),

  body('review.*.text')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('Review text must be at most 1000 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category must be provided.')
    .isMongoId()
    .withMessage('Category must be a valid ObjectId'),
];
