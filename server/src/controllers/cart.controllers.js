const Cart = require('../models/cart.models');

exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { product, quantity, price } = req.body.cartItems;

    let cart = await Cart.findOne({ user: userId });

    let condition, update;

    if (cart) {
      // Check if product already exists in the cart
      const item = cart.cartItems.find(
        (c) => c.product.toString() === product.toString() // Product is ObjectId so convert it into string
      );

      if (item) {
        // Update quantity and price
        condition = { user: userId, 'cartItems.product': product };
        update = {
          $set: {
            'cartItems.$': {
              product,
              price: item.price + price,
              quantity: item.quantity + quantity,
            },
          },
        };
      } else {
        // Add new product
        condition = { user: userId };
        update = {
          $push: { cartItems: { product, quantity, price } },
        };
      }
    } else {
      // Create new cart with user field
      condition = { user: userId };
      update = {
        $push: { cartItems: { product, quantity, price } },
        $setOnInsert: { user: userId },
      };
    }

    const updatedCart = await Cart.findOneAndUpdate(condition, update, {
      upsert: true,
      new: true,
    });

    return res.json(updatedCart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
