const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true, // ✅ Indexed
    },
    address: {
      type: String,
      required: true,
      trim: true,
      index: true, // ✅ Indexed for search
    },
    rooms: {
      type: Number,
      required: true,
      min: 1,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1,
    },
    area: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      index: true, // ✅ Indexed
    },
    images: {
      type: [String],
      required: true,
    },
    video: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Optional compound index for common queries
propertySchema.index({ price: 1, rating: -1 });

module.exports = mongoose.model('Property', propertySchema);
