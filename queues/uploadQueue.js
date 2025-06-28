// lib/queues/uploadQueue.js
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const fs = require('fs/promises');
const path = require('path');
const uploadFileToBlob = require('../utils/uploadToBlob');
const Property = require('../models/Property');

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});


const uploadQueue = new Queue('uploadMedia', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Worker to process media upload jobs
const uploadWorker = new Worker(
  'uploadMedia',
  async job => {
    const { propertyId, imagePaths = [], videoPath = null } = job.data;

    try {
      const imageUrls = await Promise.all(
        imagePaths.map(async filePath => {
          const buffer = await fs.readFile(filePath);
          const url = await uploadFileToBlob(buffer, path.basename(filePath), 'image/jpeg');
          await fs.unlink(filePath);
          return url;
        })
      );

      let videoUrl = null;
      if (videoPath) {
        const buffer = await fs.readFile(videoPath);
        videoUrl = await uploadFileToBlob(buffer, path.basename(videoPath), 'video/mp4');
        await fs.unlink(videoPath);
      }

      await Property.findByIdAndUpdate(propertyId, {
        images: imageUrls,
        video: videoUrl,
        uploadStatus: 'completed',
      });

      console.log(`✅ Media uploaded for property ${propertyId}`);
    } catch (err) {
      console.error(`❌ Upload job failed for property ${propertyId}:`, err);
      await Property.findByIdAndUpdate(propertyId, { uploadStatus: 'failed' });
      throw err;
    }
  },
  { connection }
);

module.exports = uploadQueue;
