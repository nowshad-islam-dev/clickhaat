const slugify = require('slugify');
const mongoose = require('mongoose');
const Category = require('../models/category.models');
const Product = require('../models/product.models');

function buildCategoryTree(categories) {
  // Group categories by parentId
  const map = {};
  categories.forEach((cat) => {
    const parentId = cat.parentId ? String(cat.parentId) : null;
    if (!map[parentId]) map[parentId] = [];
    map[parentId].push(cat);
  });

  // Recursive builder
  function buildTree(parentId = null) {
    return (map[parentId] || []).map((cat) => ({
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      children: buildTree(String(cat._id)),
    }));
  }

  return buildTree();
}

exports.createCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    let categoryImg = {};
    if (req.fileUrl) {
      categoryImg.url = req.fileUrl;
    }

    const slug = slugify(name, { lower: true });
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists.' });
    }

    const newCategoryObj = { name, slug, image: categoryImg };

    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(404).json({ error: 'Invalid parentId format.' });
      }

      const isParentValid = await Category.findById(parentId);
      if (!isParentValid) {
        return res.status(404).json({ error: 'Parent category not found.' });
      }
      newCategoryObj.parentId = parentId;
    }

    const newCategory = await Category.create(newCategoryObj);

    return res.status(201).json(newCategory);
  } catch (err) {
    console.log('Error-->(category):', err);
    return res.status(500).json({ error: 'Failed to create category.' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, parentId } = req.body;

    const existing = await Category.exists({ _id: categoryId });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    if (parentId) {
      const isParentValid = await Category.exists({ _id: parentId });
      if (!isParentValid) {
        return res.status(404).json({ error: 'Parent category not found.' });
      }
    }

    const hasUpdatableField = [name, parentId].some(
      (field) => field !== '' && field != undefined
    );

    if (!hasUpdatableField) {
      return res
        .status(400)
        .json({ error: 'Provide at least one field to update.' });
    }

    const slug = slugify(name, { lower: true });

    const updateFields = {};
    if (name) {
      updateFields.name = name;
      updateFields.slug = slug;
    }
    if (parentId) updateFields.parentId = parentId;

    const updateCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Category updated successfully.',
      data: updateCategory,
    });
  } catch (err) {
    console.log('Error-->(category):', err);
    return res.status(500).json({ error: 'Failed to update category.' });
  }
};

exports.deleteCategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { categoryId } = req.params;

    const existing = await Category.exists({ _id: categoryId });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const defaultCategory = await Category.findOne({ name: 'uncategorized' });
    if (!defaultCategory) {
      throw new Error('Default "uncategorized" category not found.');
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
      message: 'Category deleted successfully.',
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.log('Error-->(category):', err);
    return res.status(500).json({ error: 'Failed to delete category.' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});

    const categoryList = buildCategoryTree(categories);

    return res.status(200).json({ categoryList });
  } catch (err) {
    console.log('Error-->(category):', err);
    return res.status(500).json({ error: 'Failed to fetch all categories.' });
  }
};
