const uploadFileToBlob = require('../utils/uploadToBlob');

const uploadMedia = async (req, res) => {
  try {
    const files = req.files;

    // Upload images
    const imageUrls = await Promise.all(
      (files.images || []).map((file) =>
        uploadFileToBlob(file.buffer, file.originalname, file.mimetype)
      )
    );

    // Upload video if provided
    let videoUrl = null;
    if (files.video && files.video[0]) {
      const file = files.video[0];
      videoUrl = await uploadFileToBlob(file.buffer, file.originalname, file.mimetype);
    }

    // Respond with uploaded URLs
    res.status(200).json({
      images: imageUrls,
      video: videoUrl,
    });
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

module.exports = { uploadMedia };
