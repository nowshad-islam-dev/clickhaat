const slugify = require('slugify');
const Product = require('../models/product.models');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category, quantity } = req.body;

    let picture = [];
    if (req.files.length > 0) {
      picture = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
      }));
    }

    let product = new Product({
      name,
      slug: slugify(name, { lower: true }),
      price,
      description,
      category,
      createdBy: req.user.id,
      picture,
      quantity,
    });

    await product.save();
    return res.status(201).json({ message: 'Prouct created succesfully.' });
  } catch (err) {
    console.log('Err', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
