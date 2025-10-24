const slugify = require('slugify');
const Product = require('../models/product.models');
const Category = require('../models/category.models');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category, quantity, offer } = req.body;

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
      offer,
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

exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, price, description, category, quantity, offer } = req.body;

    // exists() is lightweight than findById()
    // since the later one fetches whole object
    // whereas the first method on fetches {_id: ObjectId}
    const productExists = await Product.exists({ _id: productId });
    if (!productExists)
      return res.status(404).json({ error: "Product doesn't exists." });

    if (category) {
      const categoryExists = await Category.exists({ _id: category });
      if (!categoryExists)
        return res.status(400).json({ error: 'Provided category is invalid.' });
    }

    const hasUpdatableField = [
      name,
      price,
      description,
      quantity,
      offer,
      category,
    ].some((field) => field != undefined && field !== '');

    if (!hasUpdatableField) {
      return res
        .status(400)
        .json({ error: 'Provide at least one field to update.' });
    }

    // Prepare update payload dynamically to avoid overwriting with undefined
    const updateFields = {};
    if (name) {
      (updateFields.name = name),
        (updateFields.slug = slugify(name, { lower: true }));
    }
    if (price) updateFields.price = price;
    if (description) updateFields.description = description;
    if (category) updateFields.category = category;
    if (quantity) updateFields.quantity = quantity;
    if (offer) updateFields.offer = offer;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res
      .status(200)
      .json({ message: 'Product updated successfully.', data: updatedProduct });
  } catch (err) {
    console.log('Error-->(product):', err);
    return res.status(500).json({ error: 'Failed to update product.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const productExists = await Product.exists({ _id: productId });
    if (!productExists)
      return res.status(404).json({ error: "Product doesn't exists." });

    await Product.findByIdAndDelete(productId);
    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.log('Error-->(product):', err);
    return res.status(500).json({ error: 'Failed to delete product.' });
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
