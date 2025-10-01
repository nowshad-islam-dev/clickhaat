const slugify = require('slugify');
const mongoose = require('mongoose');
const Category = require('../models/category.models');

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

    const slug = slugify(name, { lower: true });
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists.' });
    }

    const newCategoryObj = { name, slug };

    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(404).json({ message: 'Invalid parentId format.' });
      }

      const isParentValid = await Category.findById(parentId);
      if (!isParentValid) {
        return res.status(404).json({ message: 'Parent category not found.' });
      }
      newCategoryObj.parentId = parentId;
    }

    const newCategory = await Category.create(newCategoryObj);

    return res.status(201).json(newCategory);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});

    if (!categories)
      return res.status(404).json({ message: 'Categories not found.' });

    const categoryList = buildCategoryTree(categories);

    return res.status(200).json({ categoryList });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
