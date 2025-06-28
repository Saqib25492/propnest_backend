// controllers/propertyController.js
const fs = require('fs')
const path = require('path')
const busboy = require('busboy')
const Property = require('../models/Property')
const uploadQueue = require('../queues/uploadQueue')

const queueMediaUpload = async (propertyId, imagePaths, videoPath) => {
  await uploadQueue.add('uploadMediaJob', {
    propertyId,
    imagePaths,
    videoPath,
  })
}

const createProperty = (req, res) => {
  const bb = busboy({ headers: req.headers })
  const fields = {}
  const imagePaths = []
  let videoPath = null

  bb.on('field', (fieldname, val) => {
    fields[fieldname] = val
  })

  bb.on('file', (fieldname, file, filename) => {
    const tempFilePath = path.join(__dirname, '../temp', `${Date.now()}-${filename}`)
    const writeStream = fs.createWriteStream(tempFilePath)
    file.pipe(writeStream)

    writeStream.on('close', () => {
      if (fieldname === 'video') {
        videoPath = tempFilePath
      } else {
        imagePaths.push(tempFilePath)
      }
    })
  })

  bb.on('finish', async () => {
    try {
      const { title, rating = 0, address, rooms, bathrooms, area, price } = fields

      const newProperty = await Property.create({
        title,
        rating,
        address,
        rooms,
        bathrooms,
        area,
        price,
        images: [],
        video: null,
        uploadStatus: 'pending',
      })

      await queueMediaUpload(newProperty._id, imagePaths, videoPath)

      res.status(201).json({
        message: 'Property and media successfully queued for upload',
        propertyId: newProperty._id,
      })
    } catch (error) {
      console.error('Create Property Error:', error.message)
      res.status(500).json({ message: 'Server Error', error: error.message })
    }
  })

  req.pipe(bb)
}



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
