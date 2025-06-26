const Property = require('../models/Property');
const uploadFileToBlob = require('../utils/uploadToBlob');

const createProperty = async (req, res) => {
  try {
    const { title, rating, address, rooms, bathrooms, area, price } = req.body;
    const files = req.files;

    const imageUrls = await Promise.all(
      files.map(file =>
        uploadFileToBlob(file.buffer, file.originalname, file.mimetype)
      )
    );

    const newProperty = await Property.create({
      title,
      rating,
      address,
      rooms,
      bathrooms,
      area,
      price,
      images: imageUrls,
      video: null,
    });

    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Create Property Error:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



const addPropertyVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const file = req.file;

    // Upload to Azure Blob
    const videoUrl = await uploadFileToBlob(file.buffer, file.originalname, file.mimetype);

    // Update property with video URL
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { video: videoUrl },
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({
      message: 'Video uploaded and attached successfully',
      video: videoUrl,
      property: updatedProperty
    });
  } catch (error) {
    console.error('Upload Video Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all properties
// @route   GET /api/properties
const getProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // added for faster, lighter read
      Property.countDocuments()
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
  addPropertyVideo,
  
};
