const express = require('express');
const router = express.Router();

const { createProperty, getProperties, addPropertyVideo } = require('../controllers/propertyController');
const upload = require('../middlewares/upload'); // 👈 multer middleware

// Create a property (with image upload)
router.post('/', upload.array('images', 5), createProperty);
router.post('/:id/video', upload.single('video'), addPropertyVideo); // 👈 single video upload

// Get all properties
router.get('/', getProperties);

module.exports = router;
