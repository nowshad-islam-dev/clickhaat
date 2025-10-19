const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 30,
      required: true,
    },
    slug: { type: String, trim: true, required: true, unique: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    image: {
      url: { type: String, default: '' },
      alt: { type: String, trim: true, maxLength: 20 },
      isPrimary: { type: Boolean, default: true },
    },
  },
  { timestamps: true, versionKey: false }
);


module.exports = mongoose.model('Category', categorySchema);
