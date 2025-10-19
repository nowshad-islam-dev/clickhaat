const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minLength: 6,
      maxLength: 500,
    },
    slug: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
    },
    price: { type: Number, default: 0 },
    description: {
      type: String,
      trim: true,
      required: true,
      minLength: 20,
      maxLength: 3000,
    },
    quantity: { type: Number, default: 0 },
    offer: { type: Number, min: 0, max: 100, default: 0 },
    picture: [
      {
        url: { type: String, default: '' },
        alt: { type: String, trim: true, maxLength: 20 },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    review: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, trim: true, maxLength: 1000 },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

productSchema.index({ price: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
