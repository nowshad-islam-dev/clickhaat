const express = require('express');

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} = require('../controllers/product.controllers');
const { requireSignin, isAdmin } = require('../middlewares/auth.middlewares');
const { uploadArray } = require('../middlewares/multer.middlewares');
const { isRequestValidated } = require('../validators/auth.validators');
const {
  validateProductCreationRequest,
  validateProductUpdateRequest,
  validateProductDeleteRequest,
} = require('../validators/product.validators');

const router = express.Router();

router.post(
  '/create',
  requireSignin,
  isAdmin,
  uploadArray('picture', 'products'),
  validateProductCreationRequest,
  isRequestValidated,
  createProduct
);

router.put(
  '/update/:productId',
  requireSignin,
  isAdmin,
  validateProductUpdateRequest,
  isRequestValidated,
  updateProduct
);

router.delete(
  '/delete/:productId',
  requireSignin,
  isAdmin,
  validateProductDeleteRequest,
  isRequestValidated,
  deleteProduct
);

router.get('/all', getProducts);

module.exports = router;
