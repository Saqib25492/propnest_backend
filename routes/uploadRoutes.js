const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { uploadMedia } = require('../controllers/uploadController');

router.post(
  '/media',
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 },
  ]),
  uploadMedia
);

module.exports = router;
