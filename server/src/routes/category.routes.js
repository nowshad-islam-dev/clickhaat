const express = require('express');
const {
  createCategory,
  updateCategory,
  getCategories,
  deleteCategory,
} = require('../controllers/category.controllers');
const { requireSignin, isAdmin } = require('../middlewares/auth.middlewares');
const { uploadSingle } = require('../middlewares/multer.middlewares');
const {
  validateCategoryCreationRequest,
  validateCategoryUpdateRequest,
  validateCategoryDeleteRequest,
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

router.put(
  '/update/:categoryId',
  requireSignin,
  isAdmin,
  validateCategoryUpdateRequest,
  isRequestValidated,
  updateCategory
);

router.delete(
  '/delete/:categoryId',
  requireSignin,
  isAdmin,
  validateCategoryDeleteRequest,
  isRequestValidated,
  deleteCategory
);

router.get('/all', getCategories);

module.exports = router;
