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
  const bb = busboy({ headers: req.headers });
  const fields = {};
  const files = [];

  // Collect fields
  bb.on('field', (fieldname, val) => {
    fields[fieldname] = val;
  });

  // Collect file streams and destination paths
  bb.on('file', (fieldname, file, filename) => {
    const tempFilePath = path.join(__dirname, '../temp', `${Date.now()}-${filename}`);
    files.push({ fieldname, file, tempFilePath });
  });

  bb.on('finish', async () => {
    try {
      const { title, rating = 0, address, rooms, bathrooms, area, price } = fields;

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
      });

      // ✅ Send response immediately
      res.status(201).json({
        message: 'Property created. Media will be uploaded in the background.',
        propertyId: newProperty._id,
      });

      // ✅ Handle file writes + upload after response
      setImmediate(() => {
        const writeFilePromises = files.map(({ fieldname, file, tempFilePath }) => {
          return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(tempFilePath);
            file.pipe(writeStream);

            writeStream.on('finish', () => {
              resolve({ fieldname, path: tempFilePath });
            });

            writeStream.on('error', err => {
              console.error(`❌ Error writing file ${tempFilePath}:`, err);
              reject(err);
            });
          });
        });

        Promise.all(writeFilePromises)
          .then(results => {
            const imagePaths = [];
            let videoPath = null;

            results.forEach(({ fieldname, path }) => {
              if (fieldname === 'video') {
                videoPath = path;
              } else {
                imagePaths.push(path);
              }
            });

            // ✅ Queue upload
            queueMediaUpload(newProperty._id, imagePaths, videoPath)
              .then(() => console.log(`📥 Media upload queued for ${newProperty._id}`))
              .catch(err => {
                console.error('❌ Upload queueing failed:', err);
                Property.findByIdAndUpdate(newProperty._id, { uploadStatus: 'failed' });
              });
          })
          .catch(err => {
            console.error('❌ File writing failed (post-response):', err);
            Property.findByIdAndUpdate(newProperty._id, { uploadStatus: 'failed' });
          });
      });
    } catch (err) {
      console.error('❌ Property creation failed:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
    }
  });

  req.pipe(bb);
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
