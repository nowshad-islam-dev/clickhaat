const slugify = require('slugify');
const mongoose = require('mongoose');
const Category = require('../models/category.models');
const Product = require('../models/product.models');
const AppError = require('../utils/AppError');

function buildCategoryTree(categories) {
  // Group categories by parentId
  const map = {};
  categories.forEach((cat) => {
    const parent = cat.parentId ? String(cat.parentId) : null;
    if (!map[parent]) map[parent] = [];
    map[parent].push(cat);
  });

  // Recursive builder
  function buildTree(parent = null) {
    return (map[parent] || []).map((cat) => ({
      _id: cat._id,
      image: cat.image,
      name: cat.name,
      slug: cat.slug,
      children: buildTree(String(cat._id)),
    }));
  }

  return buildTree();
}

exports.createCategory = async (req, res) => {
  const { name, parentId } = req.body;

  let categoryImg = {};
  if (req.fileUrl) {
    categoryImg.url = req.fileUrl;
  }

  const slug = slugify(name, { lower: true });
  const existing = await Category.exists({ slug });
  if (existing) throw new AppError('Category already exists.', 400);

  const newCategoryObj = { name, slug, image: categoryImg };

  if (parentId) {
    const isParentValid = await Category.exists({_id: parentId});
    if (!isParentValid) {
      throw new AppError('Parent category not found.', 404);
    }
    newCategoryObj.parentId = parentId;
  }

  const newCategory = await Category.create(newCategoryObj);

  return res.status(201).json({
    stauts: 'success',
    message: 'Category created successfully.',
    data: newCategory,
  });
};

exports.updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { name, parentId } = req.body;

  let categoryImg = {};
  if (req.fileUrl) {
    categoryImg.url = req.fileUrl;
  }

  const existing = await Category.exists({ _id: categoryId });
  if (!existing) {
    throw new AppError('Category not found.', 404);
  }

  if (parentId) {
    const isParentValid = await Category.exists({ _id: parentId });
    if (!isParentValid) {
      throw new AppError('Parent category not found.', 404);
    }
  }

  const hasUpdatableField =
    [name, parentId].some((field) => field !== '' && field != undefined) ||
    categoryImg.url?.length > 0;

  if (!hasUpdatableField) {
    throw new AppError('Provide at least one field to update.', 400);
  }

  const updateFields = {};
  if (name) {
    updateFields.name = name;
    updateFields.slug = slugify(name, { lower: true });
  }
  if (parentId) updateFields.parentId = parentId;
  if (categoryImg) updateFields.image = categoryImg;

  const updateCategory = await Category.findByIdAndUpdate(
    categoryId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    status: 'success',
    message: 'Category updated successfully.',
    data: updateCategory,
  });
};

exports.deleteCategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { categoryId } = req.params;

  const existing = await Category.exists({ _id: categoryId });
  if (!existing) {
    throw new AppError('Category not found.', 404);
  }

  const defaultCategory = await Category.findOne({ name: 'uncategorized' });
  if (!defaultCategory) {
    throw new AppError('Default "uncategorized" category not found.', 500);
  }
  if (defaultCategory._id == categoryId) {
    throw new AppError('You cannot delete default category.', 400);
  }

  await Category.updateMany(
    { parentId: categoryId },
    { $unset: { parentId: 1 } },
    { session }
  );

  await Product.updateMany(
    { category: categoryId },
    { $set: { category: defaultCategory._id } },
    { session }
  );

  await Category.findByIdAndDelete(categoryId, { session });

  await session.commitTransaction();
  session.endSession();

  return res.status(200).json({
    status: 'success',
    message: 'Category deleted successfully.',
  });
};

exports.getCategories = async (req, res) => {
  const categories = await Category.find({});

  const categoryList = buildCategoryTree(categories);

  return res.status(200).json({
    status: 'success',
    data: categoryList,
  });
};
