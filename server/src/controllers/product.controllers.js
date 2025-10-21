const slugify = require('slugify');
const Product = require('../models/product.models');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category, quantity } = req.body;

    let picture = [];
    if (req.fileUrls.length > 0) {
      picture = req.fileUrls.map((url) => ({
        url,
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

exports.getProducts = async (req, res) => {
  try {
    // Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1;
    const search = req.query.search || '';
    const category = req.query.category || '';

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }

    // Total number of products after applying filter
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter, {
      name: 1,
      price: 1,
      description: 1,
      picture: 1,
      quantity: 1,
      offer: 1,
      category: 1,
      _id: 1,
    })
      .populate('category', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    console.log('Error-->(product):', err);
    return res.status(500).json({ error: 'Failed to fetch all products.' });
  }
};
