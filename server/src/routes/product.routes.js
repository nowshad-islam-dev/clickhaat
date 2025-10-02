const express = require('express');

const { createProduct } = require('../controllers/product.controllers');
const { requireSignin, isAdmin } = require('../middlewares/auth.middlewares');
const { uploadArray } = require('../middlewares/multer.middlewares');
const { isRequestValidated } = require('../validators/auth.validators');
const {
  validateProductCreationRequest,
} = require('../validators/product.validators');

const router = express.Router();

router.post(
  '/create',
  requireSignin,
  isAdmin,
  uploadArray('picture'),
  validateProductCreationRequest,
  isRequestValidated,
  createProduct
);

module.exports = router;
