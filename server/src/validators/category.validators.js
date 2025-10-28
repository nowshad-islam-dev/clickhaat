const { body, param } = require('express-validator');

exports.validateCategoryCreationRequest = [
  body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Category name is required.')
    .isLength({ min: 3, max: 30 })
    .withMessage('Category name must be between 3 and 30 characters.'),

  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Parent Category must be a valid ObjectId.'),

  body('image').optional().isObject().withMessage('Image must be an object.'),

  body('image.*url')
    .optional({ nullable: true })
    .isString()
    .withMessage('Image URL must be a string.')
    .isLength({ max: 2048 })
    .withMessage('Image URL is too long.'),

  body('image.*.alt')
    .optional({ nullable: true })
    .trim()
    .escape()
    .isLength({ max: 20 })
    .withMessage('Alt text must be at most 20 characters.'),

  body('image.*.isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean.'),
  ,
];

exports.validateCategoryUpdateRequest = [
  param('categoryId')
    .notEmpty()
    .withMessage('Category Id is missing in params.')
    .isMongoId()
    .withMessage('Category Id must be a valid ObjectId.'),

  body('name')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 3, max: 30 })
    .withMessage('Category name must be between 3 and 30 characters.'),

  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Parent Category must be a valid ObjectId.'),
];

exports.validateCategoryDeleteRequest = [
  param('categoryId')
    .notEmpty()
    .withMessage('Category Id is missing in params.')
    .isMongoId()
    .withMessage('Category Id must be a valid ObjectId.'),
];
