const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true, unique: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  },
  { timestamps: true }
);

categorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
