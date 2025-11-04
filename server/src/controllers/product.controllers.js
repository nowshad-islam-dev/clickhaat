const slugify = require('slugify');
const Product = require('../models/product.models');
const Category = require('../models/category.models');
const AppError = require('../utils/AppError');
const { default: mongoose } = require('mongoose');

exports.createProduct = async (req, res) => {
  const { name, price, description, category, quantity, offer } = req.body;

  const productExists = await Product.exists({ name });
  if (productExists) {
    throw new AppError('Product with this name or slug already exists.', 400);
  }

  let picture = [];
  if (req.fileUrls?.length > 0) {
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

  let createdProduct = await product.save();

  createdProduct = await Product.findById(createdProduct._id)
    .select('name price description picture quantity offer category')
    .populate('category', 'name');

  return res.status(201).json({
    status: 'success',
    message: 'Product created succesfully.',
    data: createdProduct,
  });
};

exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, price, description, category, quantity, offer } = req.body;

  // exists() is lightweight than findById()
  // since the later one fetches whole object
  // whereas the first method fetches {_id: ObjectId}
  const productExists = await Product.exists({ _id: productId });
  if (!productExists) throw new AppError("Product doesn't exists.", 404);

  if (category) {
    const categoryExists = await Category.exists({ _id: category });
    if (!categoryExists)
      throw new AppError('Provided category is invalid.', 404);
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
    throw new AppError('Provide at least one field to update.', 400);
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

  let updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .select('name price description picture quantity offer category')
    .populate('category', 'name');

  return res.status(200).json({
    status: 'success',
    message: 'Product updated successfully.',
    data: updatedProduct,
  });
};

exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;

  const productExists = await Product.exists({ _id: productId });

  if (!productExists) throw new AppError("Product doesn't exists.", 404);

  await Product.findByIdAndDelete(productId);
  return res
    .status(200)
    .json({ status: 'success', message: 'Product deleted successfully.' });
};

exports.getProducts = async (req, res) => {
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
    if (
      !mongoose.isValidObjectId(category) ||
      !(await Category.exists({ _id: category }))
    ) {
      throw new AppError('Provided category is invalid.', 404);
    }

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
  })
    .populate('category', 'name')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: 'success',
    data: {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
      products,
    },
  });
};
