// controllers/propertyController.js
const fs = require('fs')
const path = require('path')
const busboy = require('busboy')
const Property = require('../models/Property')
const uploadQueue = require('../queues/uploadQueue')


const createProperty = async (req, res) => {
  try {

    const {
      title,
      rating,
      address,
      rooms,
      bathrooms,
      area,
      price,
    } = req.body;

    // Validate required fields if needed (optional step)

    const newProperty = await Property.create({
      title,
      rating,
      address,
      rooms,
      bathrooms,
      area,
      price,
      images: [],          // empty for now
      video: null,         // empty for now
      uploadStatus: 'pending',
    });



    res.status(201).json({
      message: 'Property created successfully',
      propertyId: newProperty._id,
    });

  } catch (error) {
    console.error('Property creation failed:', error);
    res.status(500).json({
      message: 'Failed to create property',
      error: error.message,
    });
  }
};





// @desc    Get all properties
// @route   GET /api/properties
const getProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      minPrice,
      maxPrice,
      minBedrooms,     // from checkbox: 1, 2, 3, 4
      minBathrooms,    // from checkbox: 1, 2, 3
    } = req.query;

    const filters = {};

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice);
      if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }

    if (minBedrooms) {
      filters.rooms = { $gte: parseInt(minBedrooms) };
    }

    if (minBathrooms) {
      filters.bathrooms = { $gte: parseInt(minBathrooms) };
    }

    const [properties, total] = await Promise.all([
      Property.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(filters),
    ]);

    res.status(200).json({
      data: properties,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.error('Get Properties Error:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



module.exports = {
  createProperty,
  getProperties,

  
};
