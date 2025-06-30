const uploadQueue = require('../queues/uploadQueue');

const uploadMedia = async (req, res) => {
  try {
    const propertyId = req.body.propertyId;
    if (!propertyId) {
      return res.status(400).json({ message: 'Missing propertyId' });
    }

    const imagePaths = [];
    let videoPath = null;

    if (req.files.images) {
      for (const file of req.files.images) {
        imagePaths.push(file.path); // multer saves it to disk
      }
    }

    if (req.files.video && req.files.video[0]) {
      videoPath = req.files.video[0].path;
    }

    // Queue background media upload
    await uploadQueue.add('media-job', {
      propertyId,
      imagePaths,
      videoPath,
    });

    // Respond immediately
    res.status(202).json({
      message: 'Media upload queued successfully',
    });

  } catch (err) {
    console.error('UploadMedia controller error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { uploadMedia };
