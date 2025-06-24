const { v4: uuidv4 } = require('uuid');
const getContainerClient = require('../config/azureBlob');

const getContainerName = (mimeType) => {
  if (mimeType.startsWith('image/')) return process.env.AZURE_IMAGE_CONTAINER_NAME;
  if (mimeType.startsWith('video/')) return process.env.AZURE_VIDEO_CONTAINER_NAME;
  throw new Error('Unsupported file type: ' + mimeType);
};

const uploadFileToBlob = async (fileBuffer, originalName, mimeType) => {
  const containerName = getContainerName(mimeType);
  const containerClient = getContainerClient(containerName);

  const blobName = `${uuidv4()}-${originalName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  return blockBlobClient.url;
};

module.exports = uploadFileToBlob;
