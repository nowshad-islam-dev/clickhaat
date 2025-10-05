const express = require('express');
const { addItemToCart } = require('../controllers/cart.controllers');
const { requireSignin, isUser } = require('../middlewares/auth.middlewares');

const router = express.Router();

router.post('/add-item-to-cart', requireSignin, isUser, addItemToCart);

module.exports = router;
