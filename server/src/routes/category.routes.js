const express = require('express');
const {
  createCategory,
  getCategories,
} = require('../controllers/category.controllers');
const { requireSignin, isAdmin } = require('../middlewares/auth.middlewares');
const { uploadSingle } = require('../middlewares/multer.middlewares');

const router = express.Router();

router.post(
  '/create',
  requireSignin,
  isAdmin,
  uploadSingle('image'),
  createCategory
);
router.get('/all', getCategories);

module.exports = router;
