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
    return res.status(201).json({ message: 'Product created succesfully.' });
  } catch (err) {
    // Duplicate key (slug or name)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: 'Product with this name or slug already exists.' });
    }
    console.log('Error-->(product):', err);
    return res.status(500).json({ error: 'Failed to create product.' });
  }
};
