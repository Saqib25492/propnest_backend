const express = require('express');
const router = express.Router();

const { createProperty, getProperties } = require('../controllers/propertyController');
const upload = require('../middlewares/upload'); // 👈 multer middleware

// Create a property (with image upload)
router.post(
  '/',
  createProperty
);


// Get all properties
router.get('/', getProperties);

module.exports = router;
