const express = require('express');
const {
  createCategory,
  getCategories,
} = require('../controllers/category.controllers');
const { requireSignin, isAdmin } = require('../middlewares/auth.middlewares');
const { uploadSingle } = require('../middlewares/multer.middlewares');
const {
  validateCategoryCreationRequest,
} = require('../validators/category.validators');
const { isRequestValidated } = require('../validators/auth.validators');

const router = express.Router();

router.post(
  '/create',
  requireSignin,
  isAdmin,
  uploadSingle('image', 'categories'),
  validateCategoryCreationRequest,
  isRequestValidated,
  createCategory
);
router.get('/all', getCategories);

module.exports = router;
